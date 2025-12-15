// scripts/collect-feeds.ts
import { parseRssFeed } from '@/lib/rss-parser';
import feedsConfig from '@/data/feeds.json';
import { db } from '@/lib/firebaseAdmin'; // Import Firestore instance

require('dotenv').config(); // Load environment variables from .env.local

// Helper to create a Firestore-safe ID from a URL
function createDocId(link: string): string {
  // Using base64 to keep it reversible if needed
  return Buffer.from(link).toString('base64');
}

async function collectFeeds() {
  if (!db) {
    console.error('Firebase Admin not initialized. Make sure your service account key is set up correctly.');
    process.exit(1);
  }
  
  console.log('Starting feed collection process...');
  let totalArticlesCollected = 0;
  const errors: string[] = [];

  const articlesCollection = db.collection('articles');

  for (const feedConfig of feedsConfig) {
    try {
      console.log(`\nProcessing feed: ${feedConfig.name} (${feedConfig.rssUrl})`);
      const articles = await parseRssFeed(feedConfig.rssUrl);
      
      if (articles.length === 0) {
        console.log('No articles found.');
        continue;
      }

      const batch = db.batch();
      let articlesInBatch = 0;

      for (const article of articles) {
        article.source = feedConfig.name;
        article.sourceId = feedConfig.id;
        article.category = feedConfig.category;
        
        const docId = createDocId(article.link);
        const docRef = articlesCollection.doc(docId);
        
        batch.set(docRef, {
            ...article,
            pubDate: article.pubDate ? new Date(article.pubDate) : new Date(),
            createdAt: new Date(),
        }, { merge: true });

        articlesInBatch++;
      }

      await batch.commit();
      totalArticlesCollected += articlesInBatch;
      console.log(`Successfully committed ${articlesInBatch} articles from ${feedConfig.name}.`);

    } catch (error: any) {
      console.error(`Failed to collect feed from ${feedConfig.name}:`, error.message);
      errors.push(`${feedConfig.name}: ${error.message}`);
    }
  }

  console.log('\n----------------------------------------');
  console.log('Feed collection process finished.');
  console.log(`Total articles collected: ${totalArticlesCollected}`);

  if (errors.length > 0) {
    console.error('Errors occurred during collection:');
    errors.forEach(err => console.error(`- ${err}`));
    process.exit(1); // Exit with an error code if any feed failed
  }
  
  console.log('All feeds processed successfully.');
  process.exit(0);
}

collectFeeds();
