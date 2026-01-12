
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

async function deleteMalformedArticles() {
    console.log('🔍 Scanning for malformed articles (content < 200 chars)...');

    // We can't filter by calculated length in Firestore, so we fetch all or query by something else.
    // Since we likely don't have thousands yet, fetching all is okay for this maintenance script.

    const snapshot = await db.collection('articles').get();
    let deletedCount = 0;
    const batch = db.batch();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const content = data.content || '';
        const isPending = data.status === 'pending'; // Target pending ones mostly

        // Check for content length
        if (content.length < 200) {
            console.log(`🗑️ Deleting article: "${data.title}" (Content length: ${content.length})`);
            batch.delete(doc.ref);
            deletedCount++;
        }
    }

    if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ Successfully deleted ${deletedCount} malformed articles.`);
    } else {
        console.log('✨ No malformed articles found.');
    }
}

deleteMalformedArticles()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
