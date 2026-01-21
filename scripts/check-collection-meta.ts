
import { db } from "../src/lib/firebaseAdmin";

async function check() {
    if (!db) {
        console.error("DB not initialized");
        return;
    }
    const doc = await db.collection("metadata").doc("collection").get();
    if (doc.exists) {
        console.log("Collection Metadata:", JSON.stringify(doc.data(), null, 2));
    } else {
        console.log("Collection Metadata does not exist.");
    }
}

check().catch(console.error);
