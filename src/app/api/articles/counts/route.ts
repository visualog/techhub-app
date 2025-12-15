import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { categories } from '@/data/categories';

export async function GET() {
  try {
    const articlesCollection = db.collection('articles');
    const counts: Record<string, number> = {};

    // Get total count for 'all'
    const allSnapshot = await articlesCollection.count().get();
    counts['all'] = allSnapshot.data().count;

    // Get counts for each specific category
    for (const category of categories) {
      if (category.id !== 'all') {
        const categorySnapshot = await articlesCollection.where('category', '==', category.id).count().get();
        counts[category.id] = categorySnapshot.data().count;
      }
    }

    return NextResponse.json(counts, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    });
  } catch (error) {
    console.error('Error fetching article counts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
