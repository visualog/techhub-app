
import { db, admin } from "../src/lib/firebaseAdmin";

async function seed() {
    if (!db) return;
    const docRef = db.collection("metadata").doc("collection");
    await docRef.set({
        lastRunAt: admin.firestore.Timestamp.now(),
        articlesFound: 24,
        successCount: 22,
        failCount: 2,
        durationMs: 45200,
        status: 'success'
    });
    console.log("Mock Collection Metadata seeded!");
}

seed().catch(console.error);
