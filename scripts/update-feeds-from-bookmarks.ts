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
    const categoryMatch = line.match(/^##\s*(.*?)\s*\(\d+개\)/);
    if (categoryMatch) {
      const rawCategoryNameWithEmoji = categoryMatch[1].trim(); // e.g., "🤖 AI" or "💻 개발/테크"
      // Remove leading emoji and any whitespace immediately following it
      // Replace any character that is not a letter or number at the start
      const cleanCategoryText = rawCategoryNameWithEmoji.replace(/^[^\p{L}\p{N}]*/u, '').trim();
      
      currentCategory = CATEGORY_MAP[cleanCategoryText];
      if (!currentCategory) {
        console.warn(`Category "${rawCategoryNameWithEmoji}" (cleaned to "${cleanCategoryText}") not directly found in CATEGORY_MAP. Defaulting to "${cleanCategoryText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"`);
        currentCategory = cleanCategoryText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      continue;
    }

    // Detect list items with links (e.g., "1. [CLOVA Tech Blog](https://clova.ai/tech-blog)")
    const linkMatch = line.match(/^\d+\.\s+\[(.*?)\]\((.*?)\)/);
    if (linkMatch && currentCategory) {
      const name = linkMatch[1].trim();
      let url = linkMatch[2].trim();
      
      // Remove trailing slash for consistency
      if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      
      bookmarks.push({ name, url, category: currentCategory });
    }
  }
  return bookmarks;
}

// Heuristic to guess if a URL is an RSS feed URL
function guessRssUrl(url: string): string | null {
  // Check for common RSS indicators in the URL itself first
  if (/(feed|rss|atom)(\.xml|\/|\b)/i.test(url)) {
    return url;
  }
  
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // --- Explicit Mappings (High Priority) ---
    // AI
    if (url.includes('clova.ai/tech-blog')) return 'https://d2.naver.com/d2.atom'; // NOTE: Clova often shares D2 feed or has none, but D2 is safest for Naver Tech
    if (url.includes('vcat.ai/blog')) return 'https://vcat.ai/blog/rss.xml'; 
    if (url.includes('openai.com')) return 'https://openai.com/index/rss.xml';
    if (url.includes('blog.google/intl/ko-kr')) return 'https://blog.google/intl/ko-kr/rss/';
    
    // Dev/Tech
    if (url.includes('d2.naver.com')) return 'https://d2.naver.com/d2.atom';
    if (url.includes('tech.kakao.com')) return 'https://tech.kakao.com/feed/'; 
    if (url.includes('toss.tech')) return 'https://toss.tech/rss.xml';
    if (url.includes('app.dalpha.so/blog')) return 'https://app.dalpha.so/blog/feed';
    if (url.includes('techblog.woowahan.com')) return 'https://techblog.woowahan.com/feed/';
    if (url.includes('medium.com/coupang-engineering')) return 'https://medium.com/feed/coupang-engineering';
    if (url.includes('d2sf.naver.com')) return 'https://d2sf.naver.com/atom';
    if (url.includes('techblogposts.com')) return 'https://www.techblogposts.com/ko/rss';
    if (url.includes('44bits.io')) return 'https://www.44bits.io/ko/feed';
    
    // Design/UX
    if (url.includes('designcompass.org/magazine')) return 'https://designcompass.org/feed/';
    if (url.includes('pxd.co.kr')) return 'https://story.pxd.co.kr/feed/';
    if (url.includes('blog.rightbrain.co.kr')) return 'https://blog.rightbrain.co.kr/feed/';
    if (url.includes('uibowl.io')) return 'https://uibowl.io/blog/rss.xml'; // Guess
    if (url.includes('figmapedia.com')) return 'https://www.figmapedia.com/rss.xml'; // Guess
    if (url.includes('wwit.design')) return 'https://wwit.design/rss.xml'; // Guess

    // Marketing/Trends
    if (url.includes('blog.opensurvey.co.kr')) return 'https://blog.opensurvey.co.kr/feed/';
    if (url.includes('magazine.cheil.com')) return 'https://magazine.cheil.com/feed/';
    if (url.includes('blog.effic.biz')) return 'https://blog.effic.biz/feed/';
    if (url.includes('blog.socialmkt.co.kr')) return 'https://blog.socialmkt.co.kr/feed/';
    if (url.includes('kakao.vc/blog')) return 'https://www.kakao.vc/blog/feed/';
    if (url.includes('blog.nasmedia.co.kr')) return 'https://blog.nasmedia.co.kr/feed';

    // Platform Specific RegEx
    
    // Tistory
    if (hostname.includes('tistory.com')) {
      return `${parsedUrl.origin}/rss`;
    }

    // Brunch
    if (url.includes('brunch.co.kr')) {
      if (parsedUrl.pathname.endsWith('/feed')) return url;
      // Extract username from @username in path
      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      const userPart = pathParts.find(p => p.startsWith('@'));
      if (userPart) {
        return `https://brunch.co.kr/rss/${userPart}`;
      }
      return null;
    }

    // Medium
    if (hostname.includes('medium.com')) {
        if (parsedUrl.pathname.startsWith('/feed/')) return url;
        // Check for /@username
        const pathParts = parsedUrl.pathname.split('/').filter(p => p);
        if (pathParts[0] && pathParts[0].startsWith('@')) {
          return `${parsedUrl.origin}/feed/${pathParts[0]}`;
        } 
        // Check for custom domain publication or standard publication
        // If it's a publication URL like medium.com/publication-name
        if (pathParts.length === 1 && !pathParts[0].startsWith('@') && !['about', 'membership'].includes(pathParts[0])) {
             return `${parsedUrl.origin}/feed/${pathParts[0]}`;
        }
    }

    // Velog
    if (hostname.includes('velog.io')) {
        // velog.io/@username
         const pathParts = parsedUrl.pathname.split('/').filter(p => p);
         if (pathParts[0] && pathParts[0].startsWith('@')) {
             return `https://v2.velog.io/rss/${pathParts[0]}`;
         }
    }
    
    // WordPress common patterns (wp-content, etc. usually imply /feed)
    // difficult to guess without checking, but let's try standard /feed
    
    // URLs confirmed to NOT have RSS or too complex to guess
    if (url.includes('coupang.jobs')) return null; 
    if (url.includes('data.go.kr')) return null;
    if (url.includes('design.co.kr')) return null;
    if (url.includes('gdweb.co.kr')) return null;
    if (url.includes('lifeboosta.com')) return null;
    if (url.includes('canva.com')) return null;
    if (url.includes('pinterest.com')) return null;
    if (url.includes('dribbble.com')) return null;
    if (url.includes('awwwards.com')) return null;
    if (url.includes('spline.design')) return null;
    if (url.includes('discord.com')) return null;
    if (url.includes('justinmind.com')) return null;
    if (url.includes('hongong.hanbit.co.kr')) return null; // Often static or complex
    
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