import { PlaywrightCrawler, Configuration } from 'crawlee';
import { URL } from 'url';
import Parser from 'rss-parser';
import axios from 'axios';
import { db, admin } from '../src/lib/firebaseAdmin'; // Firebase Admin instance
import { summarize } from '../src/lib/ai-provider'; // AI summarizer
import feedsConfig from '../src/data/feeds.json';
import { Article } from '../src/data/mock-articles';
import { generateTags } from '../src/lib/tagger'; // Import tagger

// Helper to create a Firestore-safe ID from a URL
function createDocId(link: string): string {
  // Use URL-safe base64 encoding and replace characters not allowed in Firestore paths
  return Buffer.from(link).toString('base64')
    .replace(/\//g, '_'); // Replace '/' with '_'
}

const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
};

async function main() {
  console.log("--- SCRIPT EXECUTION STARTED ---");
  if (!db) {
    console.error('Firebase Admin not initialized. Make sure your service account key is set up correctly.');
    process.exit(1);
  }
  console.log('Starting crawl and summarize process...');

  const rssParser = new Parser({
    customFields: {
      item: ['media:content', 'media:thumbnail', 'content:encoded'],
    },
  });

  const articleMetadatas = [];
  for (const feedConfig of feedsConfig) {
    try {
      console.log(`- Fetching metadata from feed: ${feedConfig.name}`);
      let feedXml;
      // For brunch.co.kr, use playwright to fetch the feed due to redirects
      if (feedConfig.rssUrl.includes('brunch.co.kr')) {
        console.log(`  - Using Playwright to fetch brunch.co.kr feed...`);
        const { chromium } = require('playwright');
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(feedConfig.rssUrl, { waitUntil: 'domcontentloaded' });
        feedXml = await page.content();
        await browser.close();
      } else {
        const { data } = await axios.get(feedConfig.rssUrl, {
          headers: browserHeaders,
          timeout: 60000, // 60-second timeout for each RSS feed request
        });
        feedXml = data;
      }

      const feed = await rssParser.parseString(feedXml);
      for (const item of feed.items) {
        if (item.link) {
          // --- Start of Image Extraction Logic from RSS item ---
          let imageUrlFromRss = null;
          if (item['media:content'] && item['media:content'].$.url) {
            imageUrlFromRss = item['media:content'].$.url;
          } else if (item['media:thumbnail'] && item['media:thumbnail'].$.url) {
            imageUrlFromRss = item['media:thumbnail'].$.url;
          } else if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
            imageUrlFromRss = item.enclosure.url;
          } else if (item['content:encoded']) {
            const match = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
            if (match) {
              imageUrlFromRss = match[1];
            }
          }
          // --- End of Image Extraction Logic ---

          articleMetadatas.push({
            url: item.link,
            title: item.title,
            pubDate: item.isoDate || new Date().toISOString(),
            source: feed.title || feedConfig.name,
            sourceId: feedConfig.id,
            category: feedConfig.category,
            tags: item.categories || [],
            guid: item.guid,
            imageUrlFromRss: imageUrlFromRss, // Add extracted image url
          });
        }
      }
    } catch (error: any) {
      console.error(`- Failed to fetch or parse RSS feed ${feedConfig.name}:`, error);
    }
  }
  console.log(`- Found a total of ${articleMetadatas.length} articles to crawl.`);

  if (articleMetadatas.length === 0) {
    console.log('No articles to crawl. Exiting.');
    return;
  }

  // 2. Initialize and run the crawler
  const crawler = new PlaywrightCrawler({
    // headless: false, // Uncomment for debugging
    maxConcurrency: 2,
    requestHandlerTimeoutSecs: 600, // Increased timeout to 10 minutes for content fetching and summarization
    requestHandler: async ({ page, request, log }) => {
      const metadata = request.userData;

      log.info(`Crawling: ${request.url}`);

      await page.waitForLoadState('domcontentloaded');

      // --- Start of Improved Image Extraction Logic ---
      let finalImageUrl = metadata.imageUrlFromRss; // 1. Prioritize image from RSS feed

      // Helper function to resolve relative URLs
      const resolveUrl = (url: string | null) => {
        if (!url) return null;
        try {
          return new URL(url, request.url).href;
        } catch (e) {
          return null; // Invalid URL
        }
      };

      if (!finalImageUrl) {
        // 2. Fallback to various meta tags if not found in RSS
        const metaSelectors = [
          'meta[property="og:image"]',
          'meta[property="twitter:image"]',
          'meta[property="og:image:secure_url"]',
        ];
        for (const selector of metaSelectors) {
          const img = await page.locator(selector).getAttribute('content', { timeout: 2000 }).catch(() => null);
          if (img) {
            finalImageUrl = resolveUrl(img);
            if (finalImageUrl) break;
          }
        }
      }

      if (!finalImageUrl) {
        // 3. Fallback to the first image in a list of common main content areas
        const contentSelectors = [
          'article', 'main', '[role="main"]', '[role="article"]',
          '.post-content', '.entry-content', '.article-body', '.td-post-content' // Added common blog content classes
        ];
        for (const selector of contentSelectors) {
          const mainContent = page.locator(selector).first();
          if (await mainContent.count() > 0) {
            // Wait for a potential lazy-loaded image to appear
            const firstImage = mainContent.locator('img').first();
            try {
              await firstImage.waitFor({ state: 'visible', timeout: 3000 });
              const firstImageSrc = await firstImage.getAttribute('src');
              if (firstImageSrc) {
                finalImageUrl = resolveUrl(firstImageSrc);
                if (finalImageUrl) break;
              }
            } catch (e) {
              // Image did not become visible in time, or other error, continue
            }
          }
        }
      }
      // --- End of Improved Image Extraction Logic ---

      let articleText = '';
      const mainContent = page.locator('article, main, [role="main"], [role="article"]');
      if (await mainContent.count() > 0) {
        articleText = await mainContent.first().textContent() || '';
      } else {
        articleText = await page.locator('body').textContent() || '';
      }
      articleText = articleText.replace(/\s\s+/g, ' ').trim();

      log.info(`- Processed article: ${metadata.title} (Pub Date: ${metadata.pubDate})`);

      // Generate summary
      let summary = '';

      // Generate tags
      const autoTags = generateTags(metadata.title, summary || articleText.substring(0, 200));
      // Merge auto tags with existing RSS tags, deduplicating
      const mergedTags = Array.from(new Set([...(metadata.tags || []), ...autoTags]));

      // Prepare article object for Firestore
      const article: Omit<Article, 'id'> = {
        title: metadata.title,
        link: metadata.url,
        summary: summary,
        image: finalImageUrl || undefined, // Use the determined image URL
        source: metadata.source,
        sourceId: metadata.sourceId,
        category: metadata.category,
        pubDate: new Date(metadata.pubDate).toISOString(),
        tags: mergedTags, // Use merged tags
        bookmarked: false,
        isVideo: false,
        // createdAt will be handled by Firestore server timestamp or client
      };

      // Save to Firestore
      const docId = createDocId(article.link);
      const docRef = db!.collection('articles').doc(docId);

      const dataToSave = {
        ...article,
        pubDate: admin.firestore.Timestamp.fromDate(new Date(article.pubDate)),
        createdAt: admin.firestore.Timestamp.now(),
      };

      await docRef.set(dataToSave, { merge: true });
      log.info(`- Successfully saved article: ${article.title}`);
    },
    failedRequestHandler({ request, log }) {
      log.error(`Request failed: ${request.url}`);
    },
  });

  console.log(`--- CRAWLER RUNNING WITH ${articleMetadatas.length} URLs ---`);
  await crawler.run(articleMetadatas.map(meta => ({ url: meta.url, userData: meta })));

  console.log('Crawl and summarize process finished.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});