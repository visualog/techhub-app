
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { translateTitle, generateText, generateImage } from '../src/lib/ai-provider';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force Ollama for this script
if (!process.env.AI_SUMMARIZER_PROVIDER) {
    process.env.AI_SUMMARIZER_PROVIDER = 'OLLAMA';
}
if (!process.env.OLLAMA_MODEL_NAME) {
    process.env.OLLAMA_MODEL_NAME = 'exaone3.5:2.4b';
}

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
    console.log('🔍 Finding a test article...');
    const snapshot = await db.collection('articles')
        .where('status', '==', 'pending')
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log('❌ No pending articles found to test.');
        return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    console.log(`📄 Test Article Found: [${doc.id}] "${data.title}"`);

    // TEST 1: Translation
    console.log('\n--- TEST 1: Translation ---');
    console.log('Translating title...');
    try {
        const translated = await translateTitle(data.title);
        console.log(`✅ Original: ${data.title}`);
        console.log(`✅ Translated: ${translated}`);

        if (!translated || translated === data.title) {
            console.warn('⚠️ Translation might have failed or returned same text (check if unexpected).');
        }
    } catch (e) {
        console.error('❌ Translation failed:', e);
    }

    // TEST 2: Thumbnail Generation
    console.log('\n--- TEST 2: Thumbnail Generation ---');
    const promptForAI = `[System]
You are an art director. Create a detailed English image generation prompt for an article titled: "${data.title}".
The prompt should describe a modern, clean, 3D render or minimal illustration suitable for a tech blog thumbnail. 
No text in the image. Aspect ratio 4:3.
OUTPUT ONLY THE PROMPT IN ENGLISH.`;

    console.log('1. Generating Image Prompt...');
    let imagePrompt = '';
    try {
        const result = await generateText(promptForAI);
        imagePrompt = result || '';
        console.log(`✅ Generated Prompt: "${imagePrompt.substring(0, 100)}..."`);
    } catch (e) {
        console.error('❌ Prompt generation failed:', e);
        return;
    }

    if (imagePrompt) {
        console.log('2. Generating Image (this takes time)...');
        try {
            // Check if we use Gemini for images (since Ollama usually text only unless LLaVA, but here user code implies external provider or Gemini for images?)
            // Looking at ai-provider.ts, generateImage calls 'axios' to 'imagen-3.0' if provider is Gemini, 
            // OR if using Ollama... wait, Ollama provider in 'ai-provider.ts' might NOT implement generateImage or it might throw.
            // Let's check the code blindly first via execution. 
            // Actually, if AI_SUMMARIZER_PROVIDER is OLLAMA, generateImage might be unimplemented or use fallback.
            // Let's see what happens.

            // NOTE: The user's previous context shows they use Gemini for image generation in `src/lib/ai-provider.ts` -> `GeminiSummarizerProvider` implements `generateImage`.
            // But `OllamaSummarizerProvider` also implements it? 
            // Let's assume the provider factory handles it or we might need to force GEMINI for Image Gen if Ollama doesn't support it.

            // Re-reading ai-provider code in memory is hard, so I will just run it. 
            // If it fails with "Not Implemented", I'll know.

            const imageBuffer = await generateImage(imagePrompt);
            if (imageBuffer) {
                const filename = `test-thumbnail-${doc.id}.png`;
                fs.writeFileSync(filename, imageBuffer);
                console.log(`✅ Image generated successfully! Saved to ${filename}`);
            } else {
                console.error('❌ Image generation returned null.');
            }
        } catch (e) {
            console.error('❌ Image generation failed:', e);
        }
    }
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
