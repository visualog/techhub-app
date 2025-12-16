import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from '@/data/mock-articles';
import { URL } from 'url';
import { summarize } from './ai-provider';

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

function getImageFromContent(content: string): string | null {
  if (!content) return null;
  const $ = cheerio.load(content);
  const imageUrl = $('img').first().attr('src');
  return imageUrl || null;
}

async function getArticleText(link: string): Promise<string | null> {
  if (!link) return null;
  try {
    const { data } = await axios.get(link, { 
      timeout: 10000, 
      headers: browserHeaders,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });
    const $ = cheerio.load(data);
    $('script, style, noscript, iframe, header, footer, nav').remove();
    const articleText = $('body').text().replace(/\s\s+/g, ' ').trim();
    return articleText;
  } catch (error: any) {
    console.error(`- Failed to fetch article text from ${link}:`, error.message);
    return null;
  }
}

export async function parseRssFeed(feedUrl: string): Promise<Article[]> {
  try {
    let feed;
    if (feedUrl.includes('toss.tech')) {
      const { data } = await axios.get(feedUrl, { headers: browserHeaders, responseType: 'text' });
      const cleanedData = data.trim().replace(/^\uFEFF/, '');
      feed = await parser.parseString(cleanedData);
    } else {
      feed = await parser.parseURL(feedUrl);
    }
    
    const feedHostname = new URL(feed.link || feedUrl).origin;

    const articles: Article[] = [];
    for (const item of feed.items) {
      let imageUrl: string | null = null;

      imageUrl = (item as any).media?.content?.$?.url || (item as any).media?.thumbnail?.$?.url || item.enclosure?.url || null;

      const content = item['content:encoded'] || item.content;

      if (!imageUrl && content) {
        const imgFromContent = getImageFromContent(content);
        if (imgFromContent) {
          imageUrl = imgFromContent.startsWith('http') ? imgFromContent : new URL(imgFromContent, feedHostname).href;
        }
      }
      
      let summary = item.contentSnippet?.substring(0, 200) || item.summary?.substring(0, 200) || '';

      // AI Summary Generation
      if (item.link) {
        console.log(`- Generating summary for: ${item.title}`);
        const articleText = await getArticleText(item.link);
        if (articleText) {
          const aiSummary = await summarize(articleText);
          if (aiSummary) {
            summary = aiSummary;
          } else {
            console.log(`  - Failed to generate AI summary, using snippet instead.`);
          }
        } else {
          console.log(`  - Could not fetch article text, using snippet instead.`);
        }
      }

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
