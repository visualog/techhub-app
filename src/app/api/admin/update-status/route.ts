
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
    try {
        if (!db) {
            return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
        }

        const { articleId, status } = await request.json();

        if (!articleId || !status) {
            return NextResponse.json({ error: "Missing articleId or status" }, { status: 400 });
        }

        if (!['published', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        console.log(`API: Updating article ${articleId} to status '${status}'`);

        const articleRef = db.collection("articles").doc(articleId);

        // Check if doc exists first? Optional, update will fail if not found normally or create? 
        // update() fails if doc doesn't exist. set() creates. We want update.
        await articleRef.update({
            status: status,
            updatedAt: new Date() // Use server timestamp or JS Date
        });

        return NextResponse.json({ success: true, articleId, status });
    } catch (error: unknown) {
        console.error("Error updating article status:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
