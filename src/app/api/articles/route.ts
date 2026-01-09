
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

    const tag = searchParams.get("tag");

    let query: FirebaseFirestore.Query = db.collection("articles");

    // 1. Tag Filter (Database Level)
    if (tag) {
      query = query.where("tags", "array-contains", tag);
    }

    // 2. Category Filter (Database Level)
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    // Order by pubDate desc is moved to memory to avoid creating composite indexes for every combination of filters
    // query = query.orderBy("pubDate", "desc");

    // OPTIMIZATION: Limit to 100 items to find published articles buried under pending ones
    // Note: Creating composite indexes might be required for some tag/category combinations
    query = query.orderBy("pubDate", "desc").limit(100);

    const snapshot = await query.get();

    let articles: Article[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Timestamp to string for JSON serialization
        pubDate: data.pubDate?.toDate ? data.pubDate.toDate().toISOString() : data.pubDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as unknown as Article;
    });

    // 2. Search Filter (Memory Level for Phase 1)
    // Firestore does not support robust full-text search without 3rd party (Algolia/Typesense)
    if (search) {
      const lowerSearch = search.toLowerCase();
      articles = articles.filter((article) => {
        // Filter out non-published articles (admin moderation)
        // Treat undefined status as 'published' for backward compatibility
        if (article.status === 'pending' || article.status === 'rejected') {
          return false;
        }

        return (
          article.title.toLowerCase().includes(lowerSearch) ||
          (article.summary && article.summary.toLowerCase().includes(lowerSearch)) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerSearch))) ||
          article.source.toLowerCase().includes(lowerSearch)
        );
      });
    } else {
      // Even without search term, apply status filter
      articles = articles.filter(article => article.status !== 'pending' && article.status !== 'rejected');
    }

    // Sort is now handled by Firestore query
    // articles.sort((a, b) => { ... });

    return NextResponse.json(articles);
  } catch (error: unknown) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
