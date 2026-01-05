import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from '@/data/mock-articles';
import { URL } from 'url';
import { summarize } from './ai-provider';

const robotsParser = require('robots-parser');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';

const browserHeaders = {
  'User-Agent': userAgent,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
};

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content:encoded'],
  },
  headers: browserHeaders,
});

const robotsCache = new Map<string, any>();

function getImageFromContent(content: string): string | null {
  if (!content) return null;
  const $ = cheerio.load(content);
  const imageUrl = $('img').first().attr('src');
  return imageUrl || null;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndParseArticleContent(link: string): Promise<{ text: string | null; ogImage: string | null }> {
  if (!link) return { text: null, ogImage: null };

  try {
    // --- Start of robots.txt check ---
    const url = new URL(link);
    const robotsUrl = `${url.origin}/robots.txt`;
    let robots = robotsCache.get(url.origin);

    if (!robots) {
      try {
        const { data: robotsTxt } = await axios.get(robotsUrl, { timeout: 5000 });
        robots = robotsParser(robotsUrl, robotsTxt);
        robotsCache.set(url.origin, robots);
        console.log(`- Fetched and cached robots.txt for ${url.origin}`);
      } catch (error: any) {
        console.warn(`- Could not fetch or parse robots.txt for ${url.origin}. Assuming allowed.`, error.message);
        robots = robotsParser(robotsUrl, ''); // Assume allowed if robots.txt is missing
        robotsCache.set(url.origin, robots);
      }
    }

    if (robots && !robots.isAllowed(link, userAgent)) {
      console.warn(`- Crawling disallowed by robots.txt for: ${link}`);
      return { text: null, ogImage: null };
    }
    // --- End of robots.txt check ---

    const { data } = await axios.get(link, {
      timeout: 15000,
      headers: browserHeaders,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(data);

    const ogImage = $('meta[property="og:image"]').attr('content') || null;

    $('script, style, noscript, iframe, header, footer, nav, aside').remove();
    let articleText = '';
    const mainContent = $('article, main, [role="main"], [role="article"]');
    
    if (mainContent.length > 0) {
      articleText = mainContent.first().text();
    } else {
      articleText = $('body').text();
    }
    
    articleText = articleText.replace(/\s\s+/g, ' ').trim();
    console.log(`- Fetched article from ${link}, Text length: ${articleText.length}, OG Image: ${!!ogImage}`);

    return { text: articleText, ogImage };

  } catch (error: any) {
    console.error(`- Failed to fetch or parse article content from ${link}:`, error.message);
    return { text: null, ogImage: null };
  }
}

export async function parseRssFeed(feedUrl: string): Promise<Article[]> {
  try {
    console.log(`Processing feed: ${feedUrl}`);
    let feed;
    if (feedUrl.includes('toss.tech')) {
      const { data } = await axios.get(feedUrl, { headers: browserHeaders, responseType: 'text' });
      const cleanedData = data.trim().replace(/^\uFEFF/, '');
      feed = await parser.parseString(cleanedData);
    } else {
      const { data } = await axios.get(feedUrl, {
        headers: browserHeaders,
        responseType: 'text',
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      });
      feed = await parser.parseString(data);
    }
    
    const feedHostname = new URL(feed.link || feedUrl).origin;

    const articles: Article[] = [];
    for (const item of feed.items) {
      let imageUrl: string | null = null;
      let summary = '';
      const content = item['content:encoded'] || item.content;

      // --- Start of New Extraction Logic ---

      // 1. Fetch article content and ogImage from the source page
      const { text: articleText, ogImage } = item.link ? await fetchAndParseArticleContent(item.link) : { text: null, ogImage: null };
      
      // 2. Prioritize image sources
      imageUrl = ogImage // Prioritize Open Graph image
        || (item as any).media?.content?.$?.url 
        || (item as any).media?.thumbnail?.$?.url 
        || item.enclosure?.url 
        || null;

      // Fallback to image inside content if still no image
      if (!imageUrl && content) {
        const imgFromContent = getImageFromContent(content);
        if (imgFromContent) {
          imageUrl = imgFromContent.startsWith('http') ? imgFromContent : new URL(imgFromContent, feedHostname).href;
        }
      }

      // 3. Generate summary
      if (articleText) {
        console.log(`- Generating summary for: ${item.title}`);
        const aiSummary = await summarize(articleText);
        if (aiSummary) {
          summary = aiSummary;
        } else {
          console.log(`  - AI summary failed. Falling back to content snippet.`);
        }
        await sleep(1000); // Rate limit AI calls
      }
      
      // If summary is still empty, use fallback methods
      if (!summary) {
        if (item.contentSnippet) {
          summary = item.contentSnippet.substring(0, 300);
        } else if (content) {
          // A better fallback summary from the content
          const $ = cheerio.load(content);
          $('style, script').remove(); // Clean the content
          summary = $('p').first().text().substring(0, 300) || $.text().substring(0, 300);
        }
         summary = summary.trim();
      }

      // --- End of New Extraction Logic ---

      const article: Article = {
        id: item.guid || item.link || '',
        title: item.title || '',
        link: item.link || '',
        summary: summary,
        image: imageUrl || undefined,
        source: feed.title || 'Unknown Source',
        sourceId: '',
        category: '',
        pubDate: item.isoDate || new Date().toISOString(),
        tags: item.categories || [],
        bookmarked: false,
        isVideo: false,
      };
      articles.push(article);
    }
    
    return articles.filter(article => article.title && article.link);

  } catch (error: any) {
    console.error(`Error parsing RSS feed from ${feedUrl}: ${error.message}`);
    return [];
  }
}
