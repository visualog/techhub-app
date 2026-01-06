import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { categories } from '@/data/categories';

export async function GET() {
  try {
    const articlesCollection = db.collection('articles');
    const counts: Record<string, number> = {};

    // Parallelize all count queries
    const countPromises = [
      // 1. Total count
      articlesCollection.count().get().then(snap => ({ id: 'all', count: snap.data().count })),
      // 2. Category counts
      ...categories
        .filter(c => c.id !== 'all')
        .map(c =>
          articlesCollection.where('category', '==', c.id).count().get()
            .then(snap => ({ id: c.id, count: snap.data().count }))
        )
    ];

    const results = await Promise.all(countPromises);

    // Aggregate results
    results.forEach(r => {
      counts[r.id] = r.count;
    });

    return NextResponse.json(counts, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    });
  } catch (error) {
    console.error('Error fetching article counts:', error);
    // Return empty counts instead of 500 if mostly harmless? 
    // No, client handles error by showing nothing, which is cleaner than showing 0.
    // Keep 500 for genuine errors.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
