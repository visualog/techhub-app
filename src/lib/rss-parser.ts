import Parser from 'rss-parser';
import { Article } from '@/data/mock-articles'; // Re-use Article interface

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail'], // For images
  }
});

export async function parseRssFeed(feedUrl: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const articles: Article[] = feed.items.map((item: any) => {
      const imageUrl =
        item.media?.content?.$?.url || // Media content for images
        item.media?.thumbnail?.$?.url || // Media thumbnail for images
        item.enclosure?.url || // Enclosure for images
        null;

      return {
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        summary: item.contentSnippet || item.summary || item.content,
        image: imageUrl,
        source: feed.title || 'Unknown Source', // Source from feed title
        sourceId: '', // Will be set by feed collector
        category: '', // Will be set by feed collector
        pubDate: item.isoDate || new Date().toISOString(),
        tags: [], // Will be set by feed collector
      };
    });
    return articles;
  } catch (error) {
    console.error(`Error parsing feed from ${feedUrl}:`, error);
    return [];
  }
}
