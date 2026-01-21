
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("API: GET /api/admin/collection-status called");
    try {
        if (!db) {
            console.error("DB check failed: db is null");
            return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
        }

        console.log("Fetching metadata/collection doc...");
        const doc = await db.collection("metadata").doc("collection").get();
        console.log("Metadata doc fetched. exists:", doc.exists);

        if (!doc.exists) {
            return NextResponse.json({
                lastRunAt: null,
                status: 'none'
            });
        }

        const data = doc.data();

        return NextResponse.json({
            lastRunAt: data?.lastRunAt?.toDate ? data.lastRunAt.toDate().toISOString() : data?.lastRunAt,
            articlesFound: data?.articlesFound,
            successCount: data?.successCount,
            failCount: data?.failCount,
            durationMs: data?.durationMs,
            status: data?.status
        });
    } catch (error: unknown) {
        console.error("Error fetching collection status:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
