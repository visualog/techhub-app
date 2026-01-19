import { db } from "@/lib/firebaseAdmin";
import { Article } from "@/data/mock-articles";

export interface GetArticlesOptions {
    category?: string;
    tag?: string;
    search?: string;
}

export async function getArticles(options: GetArticlesOptions = {}): Promise<Article[]> {
    if (!db) {
        throw new Error("Database not initialized");
    }

    const { category, tag, search } = options;

    let query: FirebaseFirestore.Query = db.collection("articles");

    // 1. Tag Filter (Database Level)
    if (tag) {
        query = query.where("tags", "array-contains", tag);
    }

    // 2. Category Filter (Database Level)
    if (category && category !== "all") {
        query = query.where("category", "==", category);
    }

    // OPTIMIZATION: Limit to 100 items
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
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as unknown as Article;
    });

    // 3. Search Filter (Memory Level)
    // & Status Filter
    if (search) {
        const lowerSearch = search.toLowerCase();
        articles = articles.filter((article) => {
            // Filter out non-published articles
            if (article.status === 'pending' || article.status === 'rejected') {
                return false;
            }

            return (
                article.title.toLowerCase().includes(lowerSearch) ||
                (article.summary && article.summary.toLowerCase().includes(lowerSearch)) ||
                (article.tags && article.tags.some(t => t.toLowerCase().includes(lowerSearch))) ||
                article.source.toLowerCase().includes(lowerSearch)
            );
        });
    } else {
        // Even without search term, apply status filter
        articles = articles.filter(article => article.status !== 'pending' && article.status !== 'rejected');
    }

    return articles;
}
