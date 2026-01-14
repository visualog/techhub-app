
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { Article } from "@/data/mock-articles";

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("API: GET /api/admin/articles called");
    try {
        if (!db) {
            return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
        }

        // Fetch all pending articles
        // No composite index needed for simple equality check in Admin SDK usually, 
        // but sort in memory to be safe.
        const snapshot = await db.collection("articles")
            .where("status", "==", "pending")
            .get();

        const articles: Article[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Ensure serialization safety
                pubDate: data.pubDate?.toDate ? data.pubDate.toDate().toISOString() : data.pubDate,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            } as unknown as Article;
        });

        // Sort by pubDate desc (Newest first)
        articles.sort((a, b) => {
            const dateA = new Date(a.pubDate).getTime();
            const dateB = new Date(b.pubDate).getTime();
            return dateB - dateA; // Descending
        });

        return NextResponse.json(articles);
    } catch (error: unknown) {
        console.error("Error fetching admin articles:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
