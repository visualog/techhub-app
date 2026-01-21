
import { db } from "../src/lib/firebaseAdmin";

async function check() {
    if (!db) return;
    const doc = await db.collection("metadata").doc("collection").get();
    console.log("Current Status:", doc.data());
}

check().catch(console.error);
