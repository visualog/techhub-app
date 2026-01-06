import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { TrendReport } from "@/types/trends";
import { MOCK_TREND_REPORT } from "@/data/mock-trends";

export async function GET() {
    try {
        if (!db) {
            // Allow fallback in dev mode if DB not avail
            return NextResponse.json(MOCK_TREND_REPORT);
        }

        const snapshot = await db.collection("trends")
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Return mock data if no report exists yet
            return NextResponse.json(MOCK_TREND_REPORT);
        }

        const doc = snapshot.docs[0];
        const data = doc.data() as TrendReport;

        return NextResponse.json({ ...data, id: doc.id });
    } catch (error) {
        console.error("Error fetching trend report:", error);
        // Fallback to mock data on error (e.g., quota exceeded)
        return NextResponse.json(MOCK_TREND_REPORT);
    }
}
