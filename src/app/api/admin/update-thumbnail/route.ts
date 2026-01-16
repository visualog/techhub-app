import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
    try {
        const { articleId, action, imageUrl } = await req.json();

        if (!articleId) {
            return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
        }

        const docRef = db.collection('articles').doc(articleId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        let finalImageUrl: string | null = null;

        switch (action) {
            case 'url':
                // Direct URL update
                if (!imageUrl) {
                    return NextResponse.json({ error: 'imageUrl is required for action=url' }, { status: 400 });
                }
                finalImageUrl = imageUrl;
                break;

            case 'extract':
                // Extract og:image from original article
                const articleData = doc.data();
                const originalUrl = articleData?.link || articleData?.url;

                if (!originalUrl) {
                    return NextResponse.json({ error: 'Original article URL not found' }, { status: 400 });
                }

                console.log(`Extracting og:image from: ${originalUrl}`);

                try {
                    const response = await axios.get(originalUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                        },
                        timeout: 10000
                    });

                    const $ = cheerio.load(response.data);

                    // Try multiple meta tags
                    finalImageUrl = $('meta[property="og:image"]').attr('content')
                        || $('meta[property="twitter:image"]').attr('content')
                        || $('meta[name="twitter:image"]').attr('content')
                        || null;

                    if (!finalImageUrl) {
                        return NextResponse.json({ error: 'No og:image found in original article' }, { status: 404 });
                    }

                    // Resolve relative URLs
                    if (finalImageUrl && !finalImageUrl.startsWith('http')) {
                        const url = new URL(originalUrl);
                        finalImageUrl = new URL(finalImageUrl, url.origin).href;
                    }

                } catch (fetchError: any) {
                    console.error('Failed to fetch original article:', fetchError.message);
                    return NextResponse.json({ error: 'Failed to fetch original article' }, { status: 500 });
                }
                break;

            default:
                return NextResponse.json({ error: 'Invalid action. Use "url" or "extract"' }, { status: 400 });
        }

        // Update Firestore
        await docRef.update({
            image: finalImageUrl,
            thumbnailUpdatedAt: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            image: finalImageUrl
        });

    } catch (error: any) {
        console.error('Update thumbnail error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
