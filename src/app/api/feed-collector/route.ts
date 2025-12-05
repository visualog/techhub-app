import { NextResponse } from 'next/server';
import { parseRssFeed } from '@/lib/rss-parser';
import feedsConfig from '@/data/feeds.json';
import { db } from '@/lib/firebaseAdmin'; // Import Firestore instance

// Helper to create a Firestore-safe ID from a URL
function createDocId(link: string): string {
  // Using base64 to keep it reversible if needed
  return Buffer.from(link).toString('base64');
}

export async function GET() {
  if (!db) {
    return new NextResponse('Firebase Admin not initialized.', { status: 500 });
  }
  
  let totalArticlesCollected = 0;
  const errors: string[] = [];

  const articlesCollection = db.collection('articles');

  for (const feedConfig of feedsConfig) {
    try {
      const articles = await parseRssFeed(feedConfig.rssUrl);
      if (articles.length === 0) continue;

      const batch = db.batch();
      let articlesInBatch = 0;

      for (const article of articles) {
        // Assign feed-specific info
        article.source = feedConfig.name;
        article.sourceId = feedConfig.id;
        article.category = feedConfig.category;
        
        // Use a hashed version of the link as the document ID to prevent duplicates
        const docId = createDocId(article.link);
        const docRef = articlesCollection.doc(docId);
        
        // Use set with merge: true to create or update articles
        batch.set(docRef, {
            ...article,
            // Convert pubDate to Firestore Timestamp
            pubDate: article.pubDate ? new Date(article.pubDate) : new Date(),
            createdAt: new Date(),
        }, { merge: true });

        articlesInBatch++;
      }

      await batch.commit();
      totalArticlesCollected += articlesInBatch;
      console.log(`Committed ${articlesInBatch} articles from ${feedConfig.name}`);

    } catch (error: any) {
      console.error(`Failed to collect feed from ${feedConfig.name}:`, error);
      errors.push(`Failed to collect feed from ${feedConfig.name}: ${error.message}`);
    }
  }

  return NextResponse.json({
    status: 'success',
    message: `Successfully processed ${feedsConfig.length} feeds.`,
    totalArticlesCollected,
    errors: errors.length > 0 ? errors : undefined,
  });
}
