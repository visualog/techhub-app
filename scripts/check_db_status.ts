
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

async function checkDbStatus() {
    console.log('🔍 Checking Articles Collection...');
    const snapshot = await db.collection('articles').get();
    console.log(`📊 Total Articles: ${snapshot.size}`);

    const statusCounts: Record<string, number> = {};
    const pendingArticles: any[] = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status || 'undefined';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        if (status === 'pending') {
            pendingArticles.push({ id: doc.id, title: data.title, date: data.pubDate });
        }
    });

    console.log('📈 Status Breakdown:');
    console.table(statusCounts);

    if (pendingArticles.length > 0) {
        console.log('📝 First 5 Pending Articles:');
        console.table(pendingArticles.slice(0, 5));
    } else {
        console.log('⚠️ No pending articles found.');
    }
}

checkDbStatus()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
