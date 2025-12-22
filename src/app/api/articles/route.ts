import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';
import { Article } from '@/data/mock-articles';

// Source-specific fallbacks
const FALLBACK_IMAGE_MAP: { [key: string]: string } = {
  'NAVER D2': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Naver_Logotype.svg',
  'Kakao Tech': 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg',
  'Toss Tech': 'https://static.toss.im/ipd-tcs/toss_core/live/10b20142-d908-424a-95a9-4b36d655f464/image.png',
  'Google AI Blog': 'https://static.cdnlogo.com/logos/g/3/google-ai.svg',
};

// Correct "image-off" icon
const GENERIC_FALLBACK_IMAGE_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-image-off'%3E%3Cline x1='2' x2='22' y1='2' y2='22'/%3E%3Cpath d='M10.4 10.4L3.4 3.4c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l7 7'/%3E%3Cpath d='M22 12.5V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7.5'/%3E%3Cpath d='m20 7-3.5 3.5-2.5-2.5L14 10'/%3E%3C/svg%3E";


export async function GET(request: Request) {
  if (!db) {
    return new NextResponse('Firebase Admin not initialized.', { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const searchTerm = searchParams.get('search') || '';

  try {
    const articlesCollection = db.collection('articles');
    let query: admin.firestore.Query = articlesCollection;

    if (category !== 'all') {
      query = query.where('category', '==', category);
    }

    query = query.orderBy('pubDate', 'desc');

    const snapshot = await query.get();
    let articles: Article[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      const articleData = {
        ...data,
        id: doc.id,
        pubDate: data.pubDate.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      } as Article;

      if (!articleData.image) {
        articleData.image = FALLBACK_IMAGE_MAP[articleData.source] || GENERIC_FALLBACK_IMAGE_URL;
        articleData.isVideo = false;
      }

      articles.push(articleData);
    });

    // Server-side search filtering
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(lowercasedTerm) ||
        article.summary.toLowerCase().includes(lowercasedTerm) ||
        article.source.toLowerCase().includes(lowercasedTerm)
      );
    }

    return NextResponse.json(articles);

  } catch (error) {
    console.error('Error fetching articles from Firestore:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
