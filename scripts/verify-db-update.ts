
import './env-setup';
import { db } from '../src/lib/firebaseAdmin';

async function main() {
    console.log('🔍 Verifying article update in Firestore...');

    if (!db) {
        console.error('Firebase DB not initialized.');
        process.exit(1);
    }

    // Target article title from user logs: "“생각하고 답변하는” 카카오의 하이브리드 멀티모달 언어..."
    // Exact title match might be tricky if it was truncated in logs.
    // Let's search by a substring.
    const snapshot = await db.collection('articles')
        .orderBy('pubDate', 'desc')
        .limit(100)
        .get();

    const target = snapshot.docs.find(d => d.data().title.includes('생각하고 답변하는'));

    if (target) {
        const data = target.data();
        console.log(`\n✅ Found Article: "${data.title}"`);
        console.log(`   - Status: ${data.status}`);
        console.log(`   - Summary: ${data.summary}`); // This should be Korean now
        console.log(`   - UpdatedAt: ${data.updatedAt?.toDate()}`);
    } else {
        console.error('❌ Could not find the target article.');
    }
}

main().catch(console.error);
