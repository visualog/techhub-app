
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force Ollama for this script if not set
if (!process.env.AI_SUMMARIZER_PROVIDER) {
    process.env.AI_SUMMARIZER_PROVIDER = 'OLLAMA';
}
if (!process.env.OLLAMA_MODEL_NAME) {
    process.env.OLLAMA_MODEL_NAME = 'exaone3.5:2.4b';
}

// Import AFTER setting env vars
import { translateTitle } from '../src/lib/ai-provider';

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

// Helper to detect if text is mainly English
function isMainlyEnglish(text: string): boolean {
    if (!text) return false;
    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return !korean.test(text);
}

async function run() {
    console.log('🔍 Fetching pending articles...');
    const snapshot = await db.collection('articles').where('status', '==', 'pending').get();

    console.log(`📊 Found ${snapshot.size} pending articles.`);

    // Use loop to allow sequential processing if needed, but parallel is faster. 
    // Ollama might choke on too many parallel requests. Limiting concurrency is better.
    // Batch size 1 for safety with local Ollama.

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const originalTitle = data.title;

        if (isMainlyEnglish(originalTitle)) {
            console.log(`Found English title: "${originalTitle}"`);
            try {
                const translated = await translateTitle(originalTitle);
                if (translated && translated !== originalTitle) {
                    await doc.ref.update({ title: translated });
                    console.log(`  ✅ Translated to: "${translated}"`);
                } else {
                    console.log(`  ⚠️ Translation failed or same: "${translated}"`);
                }
            } catch (err) {
                console.error(`  ❌ Error translating "${originalTitle}":`, err);
            }
        } else {
            // console.log(`Skipping Korean title: "${originalTitle}"`);
        }
    }

    console.log('🎉 Done!');
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
