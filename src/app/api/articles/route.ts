import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';
import { Article } from '@/data/mock-articles'; // Re-use the interface

export async function GET(request: Request) {
  if (!db) {
    return new NextResponse('Firebase Admin not initialized.', { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  // Search term is handled client-side for the MVP as per the PRD.

  try {
    const articlesCollection = db.collection('articles');
    let query: admin.firestore.Query = articlesCollection;

    // Filter by category
    if (category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Order by publication date, descending
    query = query.orderBy('pubDate', 'desc');

    const snapshot = await query.get();
    const articles: Article[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to ISO strings for JSON serialization
      const articleData = {
        ...data,
        id: doc.id, // Use Firestore document ID
        pubDate: data.pubDate.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } as Article;
      articles.push(articleData);
    });

    return NextResponse.json(articles);

  } catch (error) {
    console.error('Error fetching articles from Firestore:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
