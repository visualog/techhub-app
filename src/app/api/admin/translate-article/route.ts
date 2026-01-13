
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { translateTitle } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { articleId } = body;

        if (!articleId) {
            return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        // 1. Fetch Article
        const docRef = db.collection('articles').doc(articleId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        const articleData = docSnap.data();
        const originalTitle = articleData?.title || "";

        // 2. Translate Title
        const translatedTitle = await translateTitle(originalTitle);

        if (!translatedTitle) {
            throw new Error("Failed to translate title");
        }

        // 3. Update Firestore
        await docRef.update({
            title: translatedTitle,
            translatedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, translatedTitle });

    } catch (error: any) {
        console.error("Error translating article:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
