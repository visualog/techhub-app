
import './env-setup';
import { db } from '../src/lib/firebaseAdmin';

async function main() {
    if (!db) process.exit(1);

    const titlesToCheck = [
        "Reliability by design",
        "Motion Highlights #15",
        "Google Stitch for UI Design",
        "지메일 기존 이메일 주소 변경 기능 실험 중"
    ];

    console.log("🔍 Fetching URLs for target articles...");

    for (const title of titlesToCheck) {
        const snapshot = await db.collection('articles')
            .where('title', '==', title)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            console.log(`\nTitle: ${data.title}`);
            console.log(`URL: ${data.link}`);
            console.log(`Source: ${data.source}`);
        } else {
            console.log(`\n❌ Not found: ${title}`);
        }
    }
}

main().catch(console.error);
