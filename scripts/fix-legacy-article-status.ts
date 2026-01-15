import './env-setup'; // Load environment variables first
import { db } from '../src/lib/firebaseAdmin';

async function main() {
    if (!db) {
        console.error('Database not initialized');
        process.exit(1);
    }

    console.log('Starting migration of legacy articles...');
    const articlesRef = db.collection('articles');
    const snapshot = await articlesRef.get();

    let updatedCount = 0;
    const batchRequests: Promise<any>[] = [];

    for (const doc of snapshot.docs) {
        const data = doc.data();
        // Check if status is 'published' (legacy) or missing
        if (data.status === 'published' || data.status === undefined || data.status === null) {
            console.log(`Updating article ${doc.id}: setting status to 'approved'`);
            batchRequests.push(doc.ref.update({ status: 'approved' }));
            updatedCount++;
        }
    }

    await Promise.all(batchRequests);
    console.log(`Migration complete. Updated ${updatedCount} articles.`);
}

main().catch(console.error);
