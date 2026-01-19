
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const { articleId } = await req.json();

        if (!articleId) {
            return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
        }

        const articleRef = db.collection("articles").doc(articleId);
        const doc = await articleRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        const data = doc.data();
        const originalTitle = data?.originalTitle;

        if (!originalTitle) {
            return NextResponse.json({ error: "Original title not found" }, { status: 400 });
        }

        await articleRef.update({
            title: originalTitle
        });

        return NextResponse.json({ success: true, title: originalTitle });
    } catch (error: any) {
        console.error("Error reverting title:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
