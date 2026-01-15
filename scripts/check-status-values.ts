
import './env-setup';
import { db } from '../src/lib/firebaseAdmin';

async function main() {
    if (!db) process.exit(1);

    console.log('Fetching all articles to check statuses...');
    const snapshot = await db.collection('articles').get();
    const statuses = new Set<string>();

    snapshot.docs.forEach(doc => {
        const s = doc.data().status;
        statuses.add(String(s)); // Convert to string to handle undefined/null as "undefined"/"null"
    });

    console.log('Unique statuses found:', Array.from(statuses));
    console.log('Total documents:', snapshot.size);
}

main().catch(console.error);
