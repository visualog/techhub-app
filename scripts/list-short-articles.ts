
import './env-setup';
import { db } from '../src/lib/firebaseAdmin';

async function main() {
    console.log('🔍 Scanning for articles with short content (< 50 chars)...');

    if (!db) {
        console.error('Firebase DB not initialized.');
        process.exit(1);
    }

    const snapshot = await db.collection('articles')
        .orderBy('pubDate', 'desc')
        .limit(100)
        .get();

    let count = 0;

    console.log('\n--- 📉 Short Content Articles ---');

    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Logic matching the re-summarization script
        const contentToSummarize = `${data.title}\n\n${data.content || data.description || ''}`;
        const len = contentToSummarize.length;

        if (len < 50) {
            count++;
            console.log(`\n${count}. [Length: ${len}]`);
            console.log(`   Title: ${data.title}`);
            console.log(`   Link:  ${data.link}`);
            console.log(`   Text Sample: "${contentToSummarize.replace(/\n/g, ' ')}"`);
        }
    }

    if (count === 0) {
        console.log('\n✅ No short articles found in the last 100 entries.');
    } else {
        console.log(`\nFound ${count} articles.`);
    }
}

main().catch(console.error);
