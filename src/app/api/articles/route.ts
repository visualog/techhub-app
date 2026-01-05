
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { Article } from "@/data/mock-articles"; // We might want to move this interface to a shared location later

// Force dynamic execution so we always get fresh data
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query: FirebaseFirestore.Query = db.collection("articles");

    // 1. Category Filter (Database Level)
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    // Order by pubDate desc
    query = query.orderBy("pubDate", "desc");

    // Limit relative huge amount to prevent reading too many docs, 
    // but in Phase 1 we might want to fetch enough to allow client search/server memory search
    const snapshot = await query.get();

    let articles: Article[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Timestamp to string for JSON serialization
        pubDate: data.pubDate?.toDate ? data.pubDate.toDate().toISOString() : data.pubDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Article;
    });

    // 2. Search Filter (Memory Level for Phase 1)
    // Firestore does not support robust full-text search without 3rd party (Algolia/Typesense)
    if (search) {
      const lowerSearch = search.toLowerCase();
      articles = articles.filter((article) => {
        return (
          article.title.toLowerCase().includes(lowerSearch) ||
          (article.summary && article.summary.toLowerCase().includes(lowerSearch)) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerSearch))) ||
          article.source.toLowerCase().includes(lowerSearch)
        );
      });
    }

    return NextResponse.json(articles);
  } catch (error: any) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
