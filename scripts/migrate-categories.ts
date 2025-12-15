// scripts/migrate-categories.ts
import { db } from '@/lib/firebaseAdmin';

async function migrateCategories() {
  if (!db) {
    console.error('Firebase Admin not initialized.');
    process.exit(1);
  }

  const articlesRef = db.collection('articles');
  const migrationMap: { [key: string]: string } = {
    'app-trend': 'it-trend',
    'ai-trend': 'ai',
    'ai-prompt': 'ai',
  };
  const oldCategories = Object.keys(migrationMap);

  console.log('Starting category migration...');
  let updatedCount = 0;

  try {
    const snapshot = await articlesRef.where('category', 'in', oldCategories).get();

    if (snapshot.empty) {
      console.log('No articles found with categories that need migration.');
      return;
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
      const article = doc.data();
      const oldCategory = article.category;
      const newCategory = migrationMap[oldCategory];
      
      if (newCategory) {
        batch.update(doc.ref, { category: newCategory });
        updatedCount++;
        console.log(`- Scheduling update for doc ${doc.id}: '${oldCategory}' -> '${newCategory}'`);
      }
    });

    await batch.commit();
    console.log(`
Successfully migrated ${updatedCount} articles.`);

  } catch (error) {
    console.error('Error during category migration:', error);
    process.exit(1);
  }

  console.log('Category migration finished.');
  process.exit(0);
}

migrateCategories();
