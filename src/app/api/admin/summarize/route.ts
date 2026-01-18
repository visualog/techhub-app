
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { summarize, translateTitle } from '@/lib/ai-provider';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Helper function to detect if text is primarily English
function isEnglishText(text: string): boolean {
    // Check if text contains mostly ASCII letters
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    const koreanChars = text.match(/[\uAC00-\uD7AF]/g) || [];
    return englishChars.length > koreanChars.length;
}

export async function POST(req: NextRequest) {
    try {
        const { articleId, url, translateTitle: translateTitleOption } = await req.json();

        if (!articleId && !url) {
            return NextResponse.json({ error: 'articleId or url is required' }, { status: 400 });
        }

        let targetUrl = url;
        let articleRef = null;
        let originalTitle = '';

        // If articleId is provided, fetch URL from Firestore
        if (articleId && db) {
            articleRef = db.collection('articles').doc(articleId);
            const doc = await articleRef.get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 });
            }
            const data = doc.data();
            targetUrl = data?.link || data?.url;
            originalTitle = data?.title || '';
        }



        if (!targetUrl) {
            return NextResponse.json({ error: 'Target URL not found' }, { status: 400 });
        }

        console.log(`Fetching content from: ${targetUrl}`);

        // Fetch page content
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, nav, footer, header, aside, .ad, .advertisement, .cookie-banner').remove();

        // Extract text from reasonable content containers
        // Try reliable selectors first
        let text = $('article').text() || $('main').text() || $('.content').text() || $('body').text();

        // Cleanup whitespace
        text = text.replace(/\s+/g, ' ').trim();

        // Truncate if too long (AI limits)
        if (text.length > 10000) {
            text = text.substring(0, 10000);
        }

        if (text.length < 50) {
            return NextResponse.json({ error: 'Extracted content is too short to summarize' }, { status: 422 });
        }

        console.log(`Summarizing text (length: ${text.length})...`);
        const summary = await summarize(text);

        if (!summary) {
            return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
        }

        // Translate title logic
        let translatedTitle: string | null = null;
        let shouldTranslateTitle = false;

        if (typeof translateTitleOption === 'boolean') {
            shouldTranslateTitle = translateTitleOption;
        } else {
            // 'auto' or undefined
            shouldTranslateTitle = originalTitle && isEnglishText(originalTitle);
        }

        if (shouldTranslateTitle && originalTitle) {
            console.log(`Translating title: ${originalTitle}`);
            translatedTitle = await translateTitle(originalTitle);
        }

        // Update Firestore if articleId was provided
        if (articleId && articleRef) {
            const updateData: Record<string, string> = { summary };
            if (translatedTitle) {
                updateData.title = translatedTitle;
                updateData.originalTitle = originalTitle; // Keep original for reference
            }
            await articleRef.update(updateData);
        }

        return NextResponse.json({
            summary,
            translatedTitle: translatedTitle || null,
            originalTitle: translatedTitle ? originalTitle : null
        });

    } catch (error: any) {
        console.error('Summarization API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
