
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { spawn } from "child_process";
import path from "path";

export async function POST() {
    try {
        if (!db) {
            return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
        }

        // Check if already running
        const doc = await db.collection("metadata").doc("collection").get();
        if (doc.exists && doc.data()?.status === 'running') {
            return NextResponse.json({ error: "Collection already in progress" }, { status: 409 });
        }

        // Trigger the script as a detached background process
        const scriptPath = path.resolve(process.cwd(), "scripts/crawl-and-summarize.ts");

        // Use npx tsx to run the script
        const child = spawn("npx", [
            "tsx",
            "scripts/crawl-and-summarize.ts"
        ], {
            cwd: process.cwd(),
            detached: true,
            stdio: 'ignore',
            env: {
                ...process.env,
                FIREBASE_SERVICE_ACCOUNT_KEY_PATH: "./serviceAccountKey.json"
            }
        });

        child.unref();

        return NextResponse.json({
            message: "Collection started",
            status: "running"
        });
    } catch (error: unknown) {
        console.error("Error triggering collection:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
