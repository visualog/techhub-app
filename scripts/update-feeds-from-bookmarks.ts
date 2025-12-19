// scripts/update-feeds-from-bookmarks.ts
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

interface Feed {
  id: string;
  name: string;
  rssUrl: string; // For now, we'll store the main URL here if no explicit RSS feed is found
  category: string;
}

interface ParsedBookmark {
  name: string;
  url: string;
  category: string;
}

const FEEDS_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'feeds.json');
const NON_RSS_SOURCES_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'non-rss-sources.json');
const BOOKMARKS_MD_PATH = path.join(process.cwd(), 'src', 'data', 'bookmarks.md'); // Path to bookmarks.md

// Map for cleaner category IDs
const CATEGORY_MAP: { [key: string]: string } = {
  "AI": "ai-trend",
  "개발/테크": "dev-blog",
  "디자인/UX": "design-ux",
  "IT 트렌드": "it-trend",
  "마케팅": "marketing",
  "스타트업/VC": "startup-vc",
  "정책/지원": "policy-support",
};

// Function to parse the markdown content
function parseMarkdownBookmarks(markdown: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  const lines = markdown.split('\n');
  let currentCategory: string | null = null;

  for (const line of lines) {
    // Detect top-level category (e.g., "## 🤖 AI (4개)")
    const categoryMatch = line.match(/^##\s+(.*?)\s+\(\d+개\)/);
    if (categoryMatch) {
      const categoryName = categoryMatch[1].trim();
      currentCategory = CATEGORY_MAP[categoryName] || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      continue;
    }

    // Detect list items with links (e.g., "1. [CLOVA Tech Blog](https://clova.ai/tech-blog)")
    const linkMatch = line.match(/^\d+\.\s+\[(.*?)\]\((.*?)\)/);
    if (linkMatch && currentCategory) {
      const name = linkMatch[1].trim();
      const url = linkMatch[2].trim();
      bookmarks.push({ name, url, category: currentCategory });
    }
  }
  return bookmarks;
}

// Heuristic to guess if a URL is an RSS feed URL
function guessRssUrl(url: string): string | null {
  // Check for common RSS indicators in the URL itself
  if (/(feed|rss|atom)(\.xml|\/|\b)/i.test(url)) {
    return url;
  }
  // Common blog platforms often have predictable RSS paths
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    // Specific heuristics for common platforms
    if (hostname.includes('tistory.com')) {
      return `${parsedUrl.origin}/rss`; // Tistory often has /rss feed
    }
    if (hostname.includes('brunch.co.kr')) {
      // Brunch usually has /@user/feed format. If not already /feed, we can't easily guess.
      if (parsedUrl.pathname.startsWith('/@') && !parsedUrl.pathname.endsWith('/feed')) {
         return `${parsedUrl.href}/feed`; // e.g., https://brunch.co.kr/@mobiinside -> https://brunch.co.kr/@mobiinside/feed
      }
    }
    if (hostname.includes('medium.com')) {
      // Medium feeds are often /feed/@username or /feed/publication
      const pathParts = parsedUrl.pathname.split('/');
      if (pathParts[1] && pathParts[1].startsWith('@')) { // /@username/
        return `${parsedUrl.origin}/feed/${pathParts[1]}`;
      } else if (pathParts[1]) { // /publication/
        return `${parsedUrl.origin}/feed/${pathParts[1]}`;
      }
    }
    if (hostname.includes('coupang.jobs')) {
      // Coupang Engineering Blog feed is often on Medium
      if (parsedUrl.href.includes('medium.com/coupang-engineering')) {
        return 'https://medium.com/feed/coupang-engineering';
      }
    }
    // Add more specific heuristics here if needed
    
  } catch (e) {
    // Invalid URL, ignore
  }
  return null;
}


async function main() {
  console.log('Updating feeds from bookmarks...');

  // 1. Read markdown content from the file
  let bookmarkMarkdown: string;
  try {
    bookmarkMarkdown = fs.readFileSync(BOOKMARKS_MD_PATH, 'utf-8');
  } catch (error: any) {
    console.error(`Error reading bookmarks file at ${BOOKMARKS_MD_PATH}:`, error.message);
    process.exit(1);
  }


  // 2. Parse bookmarks from markdown
  const parsedBookmarks = parseMarkdownBookmarks(bookmarkMarkdown);
  console.log(`Parsed ${parsedBookmarks.length} bookmarks from markdown.`);

  // 3. Load existing feeds and non-RSS sources
  let existingFeeds: Feed[] = [];
  try {
    existingFeeds = JSON.parse(fs.readFileSync(FEEDS_JSON_PATH, 'utf-8'));
  } catch (error) {
    console.warn('feeds.json not found or invalid, starting with empty feeds list.');
  }

  let existingNonRssSources: ParsedBookmark[] = [];
  try {
    existingNonRssSources = JSON.parse(fs.readFileSync(NON_RSS_SOURCES_JSON_PATH, 'utf-8'));
  } catch (error) {
    console.warn('non-rss-sources.json not found or invalid, starting with empty non-RSS list.');
  }

  const newFeeds: Feed[] = [];
  const newNonRssSources: ParsedBookmark[] = [];

  // Keep track of URLs we've already processed to avoid duplicates
  const processedRssUrls = new Set(existingFeeds.map(f => f.rssUrl));
  const processedNonRssUrls = new Set(existingNonRssSources.map(s => s.url));

  for (const bm of parsedBookmarks) {
    // Check if the exact bookmark URL is already processed as a non-RSS source
    if (processedNonRssUrls.has(bm.url)) {
      // console.log(`Skipping duplicate non-RSS URL: ${bm.url}`);
      continue;
    }

    const rssDetectedUrl = guessRssUrl(bm.url);

    if (rssDetectedUrl) {
      if (processedRssUrls.has(rssDetectedUrl)) {
        // console.log(`Skipping duplicate RSS URL: ${rssDetectedUrl}`);
        continue;
      }
      newFeeds.push({
        id: `feed-${Math.random().toString(36).substring(2, 9)}`, // Simple unique ID
        name: bm.name,
        rssUrl: rssDetectedUrl,
        category: bm.category,
      });
      processedRssUrls.add(rssDetectedUrl);
    } else {
      newNonRssSources.push(bm);
      processedNonRssUrls.add(bm.url);
    }
  }

  // 4. Merge and save updated feeds.json
  const updatedFeeds = [...existingFeeds, ...newFeeds];
  fs.writeFileSync(FEEDS_JSON_PATH, JSON.stringify(updatedFeeds, null, 2), 'utf-8');
  console.log(`Updated feeds.json with ${newFeeds.length} new RSS feeds. Total feeds: ${updatedFeeds.length}`);

  // 5. Save updated non-rss-sources.json
  const updatedNonRssSources = [...existingNonRssSources, ...newNonRssSources];
  fs.writeFileSync(NON_RSS_SOURCES_JSON_PATH, JSON.stringify(updatedNonRssSources, null, 2), 'utf-8');
  console.log(`Updated non-rss-sources.json with ${newNonRssSources.length} new non-RSS sources. Total non-RSS: ${updatedNonRssSources.length}`);

  console.log('Feed update complete.');
}

main();