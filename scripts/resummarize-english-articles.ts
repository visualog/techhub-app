
import './env-setup';
import { db } from '../src/lib/firebaseAdmin';
import { summarize } from '../src/lib/ai-provider';

async function main() {
    console.log('🔄 Starting batch re-summarization of English articles...');

    if (!db) {
        console.error('Firebase DB not initialized.');
        process.exit(1);
    }

    // 1. Fetch latest articles to check and potentially re-summarize
    // Using limit 50 for safety.
    const snapshot = await db.collection('articles')
        .orderBy('pubDate', 'desc')
        .limit(50)
        .get();

    console.log(`found ${snapshot.size} articles to check.`);

    let updatedCount = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const originalSummary = data.summary || '';

        // Heuristic: If summary contains Korean characters, skip it.
        // Korean unicode range: \uAC00-\uD7AF
        const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(originalSummary);

        if (hasKorean && originalSummary.length > 20) {
            console.log(`✅ [Skipping] Already Korean: ${data.title.substring(0, 20)}...`);
            continue;
        }

        console.log(`📝 [Processing] Re-summarizing: ${data.title.substring(0, 30)}...`);

        // Input construction: Title + Content/Description
        const contentToSummarize = `${data.title}\n\n${data.content || data.description || ''}`;
        console.log(`   - Input length: ${contentToSummarize.length}`);

        if (contentToSummarize.length < 50) {
            console.log(`   ⚠️ Content too short, skipping.`);
            continue;
        }

        try {
            // Use the newly fixed 'summarize' function which enforces Korean
            const newSummary = await summarize(contentToSummarize);

            if (newSummary) {
                await doc.ref.update({
                    summary: newSummary,
                    updatedAt: new Date()
                });
                console.log(`   ✨ Updated summary.`);
                updatedCount++;
            } else {
                console.log(`   ⚠️ Summary returned null (AI failure?).`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to summarize: ${error}`);
        }
    }

    console.log(`\n🎉 Batch operation complete. Updated ${updatedCount} articles.`);
}

main().catch(console.error);
