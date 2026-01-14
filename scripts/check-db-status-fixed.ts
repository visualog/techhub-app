
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(path.resolve(serviceAccountPath))),
        });
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        process.exit(1);
    }
}

const db = admin.firestore();

async function checkStatus() {
    console.log('--- Checking DB Status ---');
    const snapshot = await db.collection('articles').count().get();
    console.log(`Total Articles: ${snapshot.data().count}`);

    const statuses = ['pending', 'published', 'rejected', 'undefined'];
    for (const s of statuses) {
        let q = db.collection('articles');
        if (s === 'undefined') {
            // Cannot easy query undefined fields without index tricks, skip for now or try
            // Just loop a sample
        } else {
            const snap = await q.where('status', '==', s).count().get();
            console.log(`Status '${s}': ${snap.data().count}`);
        }
    }

    // Check top 10 recent
    const recent = await db.collection('articles').orderBy('pubDate', 'desc').limit(10).get();
    console.log('\nTop 10 Recent Articles:');
    recent.forEach(doc => {
        const d = doc.data();
        console.log(`- [${d.status}] ${d.title} (${d.pubDate?.toDate ? d.pubDate.toDate().toISOString() : d.pubDate})`);
    });
}

checkStatus().then(() => process.exit(0)).catch(e => console.error(e));
