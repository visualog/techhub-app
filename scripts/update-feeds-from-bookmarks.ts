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
// Function to parse the markdown content
function parseMarkdownBookmarks(markdown: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  const lines = markdown.split('\n');
  let currentCategory: string | null = null;

  for (const line of lines) {
    // Detect top-level category (e.g., "## 🤖 AI (4개)")
    const categoryMatch = line.match(/^##\s*(.*?)\s*\(\d+개\)/);
    if (categoryMatch) {
      // Clean the category name by removing emoji and count part
      const rawCategoryNameWithEmoji = categoryMatch[1].trim();
      // A more robust way to remove emojis and other non-text elements to get a clean category for mapping
      const cleanCategoryText = rawCategoryNameWithEmoji.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/gu, ' ').trim();
      
      currentCategory = CATEGORY_MAP[cleanCategoryText]; // Use direct lookup
      if (!currentCategory) {
        // Fallback to lowercased and dashed if not in map, but try to be consistent
        currentCategory = cleanCategoryText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        console.warn(`Category "${cleanCategoryText}" not found in CATEGORY_MAP, defaulting to "${currentCategory}"`);
      }
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
  
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Specific heuristics for common platforms
    if (hostname.includes('d2.naver.com')) {
      return 'https://d2.naver.com/d2.atom';
    }
    if (hostname.includes('tech.kakao.com')) {
      return 'https://tech.kakao.com/feed/';
    }
    if (hostname.includes('toss.tech')) {
      return 'https://toss.tech/rss.xml';
    }
    if (hostname.includes('clova.ai')) {
      // Clova blog home page, assume common feed path
      return `${parsedUrl.origin}/tech-blog/feed/`;
    }
    if (hostname.includes('blog.google')) {
      // Google blogs often have /rss at the root or /intl/lang/rss
      if (parsedUrl.pathname.includes('/rss')) return url;
      return `${parsedUrl.origin}/intl/ko-kr/rss/`;
    }
    if (hostname.includes('techblog.woowahan.com')) {
      return 'https://techblog.woowahan.com/feed/';
    }
    if (hostname.includes('d2sf.naver.com')) {
      return 'https://d2sf.naver.com/atom'; // D2 Startup Factory also uses atom
    }
    if (hostname.includes('coupang.jobs') && url.includes('medium.com')) {
      // This is a special case where coupang.jobs links to Medium
      return 'https://medium.com/feed/coupang-engineering';
    }

    // General blog platforms
    if (hostname.includes('tistory.com')) {
      return `${parsedUrl.origin}/rss`;
    }
    if (hostname.includes('brunch.co.kr')) {
      if (parsedUrl.pathname.endsWith('/feed')) return url;
      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      if (pathParts[0] && pathParts[0].startsWith('@')) {
        return `${parsedUrl.origin}/${pathParts[0]}/feed`;
      }
      return null;
    }
    if (hostname.includes('medium.com')) {
      if (parsedUrl.pathname.startsWith('/feed/')) return url;
      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      if (pathParts[0] && pathParts[0].startsWith('@')) {
        return `${parsedUrl.origin}/feed/${pathParts[0]}`;
      } else if (pathParts[0]) {
        return `${parsedUrl.origin}/feed/${pathParts[0]}`;
      }
      return `${parsedUrl.origin}/feed`;
    }
    if (hostname.includes('pxd.co.kr') && parsedUrl.pathname.includes('insights')) {
      // The main feed is usually /feed/ for their blog sub-domain
      return `${parsedUrl.origin}/feed/`; 
    }
    if (hostname.includes('blog.opensurvey.co.kr')) {
      return 'https://blog.opensurvey.co.kr/feed/';
    }
    if (hostname.includes('magazine.cheil.com')) {
      return 'https://magazine.cheil.com/feed/';
    }
    if (hostname.includes('blog.effic.biz')) {
      return 'https://blog.effic.biz/feed/';
    }
    if (hostname.includes('blog.socialmkt.co.kr')) {
      return 'https://blog.socialmkt.co.kr/feed/';
    }
    if (hostname.includes('kakao.vc')) {
      return 'https://www.kakao.vc/blog/feed/';
    }


    
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