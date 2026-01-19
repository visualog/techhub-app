import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { Article } from '@/data/mock-articles';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!db) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        // Efficient query using hasSummary flag (Priority 1: query-limit, query-index)
        const snapshot = await db.collection('articles')
            .where('hasSummary', '==', false)
            .limit(100)
            .get();

        const articlesWithoutSummary: Article[] = [];

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            // Skip rejected articles and check if summary is missing/empty
            if (data.status === 'rejected') return;
            if (!data.summary || data.summary.trim() === '') {
                articlesWithoutSummary.push({
                    id: doc.id,
                    ...data,
                    pubDate: data.pubDate?.toDate ? data.pubDate.toDate().toISOString() : data.pubDate,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
                } as unknown as Article);
            }
        });

        return NextResponse.json({
            count: articlesWithoutSummary.length,
            articles: articlesWithoutSummary
        });
    } catch (error: unknown) {
        console.error('Error fetching articles without summary:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
