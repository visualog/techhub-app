import { db, admin } from '../src/lib/firebaseAdmin'; // Adjust path as needed
import * as path from 'path';

// Load service account key from environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountPath) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set.');
    process.exit(1);
}

// Check if db is initialized, if not, initialize it
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
    });
}

const firestore = admin.firestore();

async function getLatestArticlePubDate() {
    try {
        const articlesCollection = firestore.collection('articles');
        const querySnapshot = await articlesCollection
            .orderBy('pubDate', 'desc')
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            console.log('No articles found in Firestore.');
            return;
        }

        const latestDoc = querySnapshot.docs[0];
        const data = latestDoc.data();
        const pubDate = data.pubDate instanceof admin.firestore.Timestamp
            ? data.pubDate.toDate()
            : new Date(data.pubDate); // Handle ISO string if not Timestamp

        console.log(`Latest article pubDate in Firestore: ${pubDate.toISOString()}`);
    } catch (error) {
        console.error('Error fetching latest article pubDate from Firestore:', error);
    } finally {
        // Optional: clean up app, though often not needed in simple scripts
        // await admin.app().delete(); 
    }
}

getLatestArticlePubDate().then(() => process.exit(0)).catch(() => process.exit(1));
