import { db } from "@/lib/firebaseAdmin";
import { Article } from "@/data/mock-articles";

export interface GetArticlesOptions {
    category?: string;
    tag?: string;
    search?: string;
}

import { unstable_cache } from 'next/cache';

const getCachedArticles = unstable_cache(
    async (category?: string, tag?: string) => {
        if (!db) {
            throw new Error("Database not initialized");
        }

        let query: FirebaseFirestore.Query = db.collection("articles");

        // 1. Tag Filter (Database Level)
        if (tag) {
            query = query.where("tags", "array-contains", tag);
        }

        // 2. Category Filter (Database Level)
        if (category && category !== "all") {
            query = query.where("category", "==", category);
        }

        // OPTIMIZATION: Status Filter (Database Level)
        query = query.where("status", "==", "published");

        // OPTIMIZATION: Limit to 100 items
        query = query.orderBy("pubDate", "desc").limit(100);

        console.log(`[Cache Miss] Fetching articles from DB for category: ${category}, tag: ${tag}`);
        const snapshot = await query.get();

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Timestamp to string for JSON serialization
                pubDate: data.pubDate?.toDate ? data.pubDate.toDate().toISOString() : data.pubDate,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as unknown as Article;
        });
    },
    ['articles-list'], // Key parts are automatically handled by cache mechanism based on args if unique, but explicit keys help
    {
        revalidate: 60, // Cache for 1 minute
        tags: ['articles']
    }
);

export async function getArticles(options: GetArticlesOptions = {}): Promise<Article[]> {
    const { category, tag, search } = options;

    // Fetch from cache (or DB if stale)
    // Note: 'search' is NOT passed to cache function to maximize hit rate. 
    // We filter search results in memory after fetching the list.
    let articles = await getCachedArticles(category, tag);

    // 3. Search Filter (Memory Level)
    if (search) {
        const lowerSearch = search.toLowerCase();
        articles = articles.filter((article) => {
            return (
                article.title.toLowerCase().includes(lowerSearch) ||
                (article.summary && article.summary.toLowerCase().includes(lowerSearch)) ||
                (article.tags && article.tags.some(t => t.toLowerCase().includes(lowerSearch))) ||
                article.source.toLowerCase().includes(lowerSearch)
            );
        });
    }

    return articles;
}
