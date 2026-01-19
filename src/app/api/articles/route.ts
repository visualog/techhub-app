
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { Article } from "@/data/mock-articles";
import { getArticles } from "@/lib/articles";

// Force dynamic execution so we always get fresh data
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const articles = await getArticles({ category, search, tag });

    return NextResponse.json(articles);
  } catch (error: unknown) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
