
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
        });
        console.log('✅ Firebase Admin Initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

async function run() {
    console.log('🔍 Searching for Toss Tech article...');
    // Look for the specific article from the screenshot "수천 개의 API/BATCH 서버를..."
    // Searching by title substring
    const snapshot = await db.collection('articles')
        .where('source', '==', '토스 기술 블로그, 토스 테크')
        .limit(1)
        .get();

    // If not found by exact source string shown in UI, try a broader search or just list recent ones
    if (snapshot.empty) {
        console.log("⚠️ No article found with exact source string. Fetching any article with '토스'...");
        const snapshot2 = await db.collection('articles').limit(20).get();
        const tossArticle = snapshot2.docs.find(d => d.data().title.includes("수천 개의"));

        if (tossArticle) {
            console.log("✅ Found Article:", tossArticle.data().title);
            console.log("ID:", tossArticle.id);
            console.log("Content Length:", (tossArticle.data().content || "").length);
            console.log("Content Preview:", (tossArticle.data().content || "").substring(0, 100));
        } else {
            console.log("❌ Could not find the specific article even with broader search.");
            // List a few titles to see what we have
            snapshot2.docs.forEach(d => console.log("-", d.data().title));
        }
    } else {
        const doc = snapshot.docs[0];
        console.log("✅ Found Article:", doc.data().title);
        console.log("ID:", doc.id);
        console.log("Content Length:", (doc.data().content || "").length);
        console.log("Content Preview:", (doc.data().content || "").substring(0, 100));
    }
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
