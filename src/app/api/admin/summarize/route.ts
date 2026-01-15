
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { summarize } from '@/lib/ai-provider';
import * as cheerio from 'cheerio';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const { articleId, url } = await req.json();

        if (!articleId && !url) {
            return NextResponse.json({ error: 'articleId or url is required' }, { status: 400 });
        }

        let targetUrl = url;
        let articleRef = null;

        // If articleId is provided, fetch URL from Firestore
        if (articleId && db) {
            articleRef = db.collection('articles').doc(articleId);
            const doc = await articleRef.get();
            if (!doc.exists) {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 });
            }
            targetUrl = doc.data()?.link || doc.data()?.url;
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

        // Update Firestore if articleId was provided
        if (articleId && articleRef) {
            await articleRef.update({ summary });
        }

        return NextResponse.json({ summary });

    } catch (error: any) {
        console.error('Summarization API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
