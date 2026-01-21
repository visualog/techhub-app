import './env-setup'; // Must be first to load environment variables
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { URL } from 'url';
import Parser from 'rss-parser';
import axios from 'axios';
import { db, admin, bucket } from '../src/lib/firebaseAdmin'; // Firebase Admin instance
import { summarize, generateText, generateImage } from '../src/lib/ai-provider'; // AI summarizer
import feedsConfig from '../src/data/feeds.json';
import { Article } from '../src/data/mock-articles';
import { generateTags } from '../src/lib/tagger'; // Import tagger

// Helper to create a Firestore-safe ID from a URL
function createDocId(link: string): string {
  // Use URL-safe base64 encoding and replace characters not allowed in Firestore paths
  return Buffer.from(link).toString('base64')
    .replace(/\//g, '_'); // Replace '/' with '_'
}

// Helper to sanitize XML content before parsing
// Fixes 'Invalid character in entity name' errors caused by unescaped '&'
function sanitizeXml(xml: string): string {
  // Replace unescaped '&' that are not part of valid entities
  // Valid entities: &amp; &lt; &gt; &quot; &apos; &#...;
  return xml.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
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
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  // Set status to running
  try {
    await db!.collection('metadata').doc('collection').set({
      status: 'running',
      startedAt: admin.firestore.Timestamp.now(),
    }, { merge: true });
  } catch (e) {
    console.error('Failed to set running status:', e);
  }

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
        // Extract raw XML text instead of HTML-wrapped page.content()
        feedXml = await page.evaluate(() => {
          const pre = document.querySelector('pre');
          if (pre) return pre.textContent || '';
          // Fallback: if displayed as raw text, body might contain it
          return document.body.innerText || '';
        });
        await browser.close();
      } else {
        const { data } = await axios.get(feedConfig.rssUrl, {
          headers: browserHeaders,
          timeout: 60000, // 60-second timeout for each RSS feed request
        });
        feedXml = data;
      }

      // Sanitize XML to fix unescaped ampersands before parsing
      const sanitizedXml = sanitizeXml(feedXml);
      const feed = await rssParser.parseString(sanitizedXml);
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

      // 0. Deduplication Check
      const docId = createDocId(metadata.url);
      const docRef = db!.collection('articles').doc(docId);
      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        log.info(`Skipping existing article: ${metadata.title}`);
        return; // Skip processing
      }

      log.info(`Crawling: ${request.url}`);

      await page.waitForLoadState('domcontentloaded');

      // --- Improved Image Extraction Logic ---
      let finalImageUrl = metadata.imageUrlFromRss;

      // Helper: Resolve relative URLs
      const resolveUrl = (url: string | null) => {
        if (!url) return null;
        try {
          return new URL(url, request.url).href;
        } catch (e) {
          return null;
        }
      };

      // 1. Scroll down to trigger lazy loading
      try {
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight || totalHeight > 3000) { // Limit scroll depth
                clearInterval(timer);
                resolve();
              }
            }, 100);
          });
        });
        await page.waitForTimeout(1000); // Wait for images to render
      } catch (e) {
        log.warning(`Failed to scroll page: ${e}`);
      }

      // 2. Site-Specific Selectors (Priority)
      const domain = new URL(request.url).hostname;
      const siteSelectors: Record<string, string> = {
        'velog.io': 'img[alt="post-thumbnail"]',
        'medium.com': 'meta[property="og:image"]',
        'brunch.co.kr': '.cover_image, .wrap_img_float img',
        'tech.kakao.com': '.cover-image img',
        'toss.tech': 'meta[property="og:image"]',
        'yozm.wishket.com': '.news-cover-image img'
      };

      // Check site specific first
      for (const [key, selector] of Object.entries(siteSelectors)) {
        if (domain.includes(key)) {
          const el = await page.locator(selector).first();
          const attr = (await el.getAttribute('src')) || (await el.getAttribute('content'));
          if (attr) {
            finalImageUrl = resolveUrl(attr);
            log.info(`  - Found image via site selector (${key}): ${finalImageUrl}`);
            break;
          }
        }
      }

      // 3. Fallback to Meta Tags (OG/Twitter)
      if (!finalImageUrl) {
        const metaSelectors = [
          'meta[property="og:image"]',
          'meta[property="twitter:image"]',
          'meta[property="og:image:secure_url"]',
        ];
        for (const selector of metaSelectors) {
          const img = await page.locator(selector).getAttribute('content', { timeout: 1000 }).catch(() => null);
          if (img) {
            finalImageUrl = resolveUrl(img);
            break;
          }
        }
      }

      // 4. Fallback to Content Images with strict filtering
      if (!finalImageUrl) {
        // Evaluate in browser context to check natural dimensions
        finalImageUrl = await page.evaluate(() => {
          const content = document.querySelector('article') || document.querySelector('main') || document.body;
          const images = Array.from(content.querySelectorAll('img'));

          for (const img of images) {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original');
            if (!src) continue;

            // Filter out SVG, data URIs, or obviously small/icon paths if possible
            if (src.startsWith('data:') || src.includes('display:none')) continue;

            // Size Check
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;

            // Must be reasonably large (>200px) and not typically square icon/profile ratio (unless very large)
            if (width > 200 && height > 150) {
              // Basic Aspect Ratio check: exclude extreme banners or tall skyscraper ads if needed
              const aspect = width / height;
              if (aspect > 0.3 && aspect < 3.5) {
                return src; // Return the first valid large image
              }
            }
          }
          return null;
        });
        if (finalImageUrl) finalImageUrl = resolveUrl(finalImageUrl);
      }
      // --- End of Improved Image Extraction Logic ---

      // 5. Last Resort: AI Image Generation
      if (!finalImageUrl) {
        try {
          console.log(`  - No image found. Attempting AI generation for "${metadata.title}"...`);

          // A. Ask AI for an English prompt
          const promptForAI = `[System]
You are an art director. Create a detailed English image generation prompt for an article titled: "${metadata.title}".
The prompt should describe a modern, clean, 3D render or minimal illustration suitable for a tech blog thumbnail. 
No text in the image. Aspect ratio 4:3.
OUTPUT ONLY THE PROMPT IN ENGLISH.`;

          const imagePrompt = await generateText(promptForAI);

          if (imagePrompt) {
            console.log(`    > Generated Prompt: ${imagePrompt.substring(0, 60)}...`);

            // B. Generate Image
            const imageBuffer = await generateImage(imagePrompt);

            if (imageBuffer && bucket) {
              const imageFileName = `thumbnails/${createDocId(metadata.url)}.png`;
              const file = bucket.file(imageFileName);

              await file.save(imageBuffer, {
                metadata: { contentType: 'image/png' },
                public: true
              });

              // Construct Public URL (using download URL or public URL format)
              // For Firebase Storage, public URL is usually:
              finalImageUrl = `https://storage.googleapis.com/${bucket.name}/${imageFileName}`;
              // Or make it signed if private, but we made it public.

              console.log(`    > AI Image Generated & Uploaded: ${finalImageUrl}`);
            } else {
              console.warn("    > Failed to generate image buffer or bucket not configured.");
            }
          }
        } catch (e) {
          console.error(`    > AI Image Generation Failed:`, e);
        }
      }

      let articleText = '';

      // Improved Content Extraction with Site-Specific Selectors
      const contentSelectors: Record<string, string> = {
        'tympanus.net': '.ct-post-content', // Codrops
        'medium.com': 'article section',    // Medium standard
        'uxplanet.org': 'article section',  // UX Planet (Medium pub)
        'protopie.io': '.w-richtext',       // Protopie blog (Webflow)
        'design.google': '.article-content', // Google Design
        'toss.tech': 'article', // Toss Tech wrapper
        'tech.kakao.com': '.post-content', // Kakao Tech
        'yozm.wishket.com': '.next-news-contents', // Wishket
        'velog.io': '.sc-bkbkJK', // Generative but usually sc-*
      };

      let specificSelector = '';
      for (const [domain, selector] of Object.entries(contentSelectors)) {
        if (metadata.url.includes(domain)) {
          specificSelector = selector;
          break;
        }
      }

      if (specificSelector) {
        try {
          const element = await page.locator(specificSelector).first();
          if (await element.count() > 0) {
            articleText = await element.innerText();
          }
        } catch (e) {
          log.warning(`  - Specific selector ${specificSelector} failed, falling back.`);
        }
      }

      // Fallback: Generic semantic selectors
      if (!articleText || articleText.length < 100) {
        const contentElement = await page.locator('article, main, [role="main"], [role="article"], .post-content, .entry-content, .content').first();
        if (await contentElement.count() > 0) {
          articleText = await contentElement.innerText();
        } else {
          // Absolute fallback: body text (likely messy)
          articleText = await page.evaluate(() => document.body.innerText);
        }
      }

      // Clean up common noise
      articleText = articleText
        .replace(/Share this article/gi, '')
        .replace(/Follow us/gi, '')
        .replace(/Advertisement/gi, '')
        .trim();
      articleText = articleText.replace(/\s\s+/g, ' ').trim();

      log.info(`- Processed article: ${metadata.title} (Pub Date: ${metadata.pubDate})`);

      // Generate summary
      let summary = '';
      if (articleText.length > 200) {
        try {
          console.log(`  - Generating summary for "${metadata.title}"...`);
          summary = await summarize(articleText) || '';

          // TRANSLATE TITLE
          console.log(`  - Translating title...`);
          const koreanTitle = await import('../src/lib/ai-provider').then(m => m.translateTitle(metadata.title));
          if (koreanTitle) {
            console.log(`    > Original: ${metadata.title}`);
            console.log(`    > Korean: ${koreanTitle}`);
            metadata.title = koreanTitle; // Update title to Korean
          }

        } catch (error) {
          console.error(`  - Failed to generate summary/translation:`, error);
        }
      } else {
        console.log(`  - Skipping summary (text too short: ${articleText.length} chars)`);
        summary = articleText; // Fallback to full text if very short
      }
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
        status: 'pending',
        // createdAt will be handled by Firestore server timestamp or client
      };

      // Save to Firestore
      // docId and docRef are already defined at the start of requestHandler

      const dataToSave = {
        ...article,
        pubDate: admin.firestore.Timestamp.fromDate(new Date(article.pubDate)),
        createdAt: admin.firestore.Timestamp.now(),
      };

      await docRef.set(dataToSave, { merge: true });
      successCount++;
      log.info(`- Successfully saved article: ${article.title}`);
    },
    failedRequestHandler({ request, log }) {
      failCount++;
      log.error(`Request failed: ${request.url}`);
    },
  });

  console.log(`--- CRAWLER RUNNING WITH ${articleMetadatas.length} URLs ---`);
  await crawler.run(articleMetadatas.map(meta => ({ url: meta.url, userData: meta })));

  // Save collection metadata
  try {
    const durationMs = Date.now() - startTime;
    console.log('Saving collection metadata...');
    await db!.collection('metadata').doc('collection').set({
      lastRunAt: admin.firestore.Timestamp.now(),
      articlesFound: articleMetadatas.length,
      successCount,
      failCount,
      durationMs,
      status: 'success'
    }, { merge: true });
    console.log('Collection metadata saved successfully.');
  } catch (error) {
    console.error('Failed to save collection metadata:', error);
  }
}

main().catch(async (err) => {
  console.error(err);
  try {
    if (db) {
      await db.collection('metadata').doc('collection').set({
        status: 'error',
        lastError: err.message || String(err),
        failedAt: admin.firestore.Timestamp.now(),
      }, { merge: true });
    }
  } catch (e) {
    console.error('Failed to save error status:', e);
  }
  process.exit(1);
});