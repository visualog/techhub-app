import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from '@/data/mock-articles';
import { URL } from 'url';

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

function getVideoFrameFromContent(content: string): string | null {
    if (!content) return null;
    const match = content.match(/<iframe[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
}

async function getThumbnailFromUrl(link: string): Promise<string | null> {
  if (!link) return null;
  try {
    const { data } = await axios.get(link, { 
      timeout: 5000, 
      headers: browserHeaders
    });
    const $ = cheerio.load(data);
    
    // 1. Try standard meta tags
    let imageUrl = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    
    // 2. If no meta tags, try the first prominent image in the body
    if (!imageUrl) {
        imageUrl = $('article img, .post-content img, .entry-content img, .main-content img').first().attr('src');
    }

    return imageUrl || null;
  } catch (error: any) {
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

    const articlesPromises = feed.items.map(async (item: any) => {
      let imageUrl: string | null = null;
      let isVideo = false;

      imageUrl = item.media?.content?.$?.url || item.media?.thumbnail?.$?.url || item.enclosure?.url || null;

      const content = item['content:encoded'] || item.content;

      if (!imageUrl && content) {
        const imgFromContent = getImageFromContent(content);
        if (imgFromContent) {
          imageUrl = imgFromContent.startsWith('http') ? imgFromContent : new URL(imgFromContent, feedHostname).href;
        }
      }

      if (!imageUrl && content) {
        const videoFrameUrl = getVideoFrameFromContent(content);
        if (videoFrameUrl) {
            const thumb = await getThumbnailFromUrl(videoFrameUrl);
            if (thumb) {
              imageUrl = thumb.startsWith('http') ? thumb : new URL(thumb, new URL(videoFrameUrl).origin).href;
              isVideo = true;
            }
        }
      }

      if (!imageUrl && item.link) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const thumb = await getThumbnailFromUrl(item.link);
        if (thumb) {
            imageUrl = thumb.startsWith('http') ? thumb : new URL(thumb, item.link).href;
        }
      }
      
      const summary = item.contentSnippet?.substring(0, 200) || item.summary?.substring(0, 200) || '';

      const article: Article = {
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        summary: summary,
        image: imageUrl || undefined,
        source: feed.title || 'Unknown Source',
        sourceId: '',
        category: '',
        pubDate: item.isoDate || new Date().toISOString(),
        tags: item.categories || [],
        bookmarked: false,
        isVideo: isVideo,
      };
      return article;
    });

    const articles = await Promise.all(articlesPromises);
    
    return articles.filter(article => article.title && article.link);

  } catch (error: any) {
    console.error(`Error parsing RSS feed from ${feedUrl}: ${error.message}`);
    return [];
  }
}
