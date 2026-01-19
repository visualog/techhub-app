import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { summarize, translateTitle } from '@/lib/ai-provider';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Helper function to detect if text is primarily English
function isEnglishText(text: string): boolean {
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    const koreanChars = text.match(/[\uAC00-\uD7AF]/g) || [];
    return englishChars.length > koreanChars.length;
}

async function summarizeArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!db) {
            return { success: false, error: 'Database not initialized' };
        }

        const articleRef = db.collection('articles').doc(articleId);
        const doc = await articleRef.get();

        if (!doc.exists) {
            return { success: false, error: 'Article not found' };
        }

        const data = doc.data();
        const targetUrl = data?.link || data?.url;
        const originalTitle = data?.title || '';

        if (!targetUrl) {
            return { success: false, error: 'No URL found' };
        }

        // Fetch page content
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

        let text = $('article').text() || $('main').text() || $('.content').text() || $('body').text();
        text = text.replace(/\s+/g, ' ').trim();

        if (text.length > 10000) {
            text = text.substring(0, 10000);
        }

        if (text.length < 50) {
            return { success: false, error: 'Content too short' };
        }

        const summary = await summarize(text);

        if (!summary) {
            return { success: false, error: 'Failed to generate summary' };
        }

        // Translate title if English
        const updateData: Record<string, any> = {
            summary,
            hasSummary: true
        };

        if (originalTitle && isEnglishText(originalTitle)) {
            const translatedTitle = await translateTitle(originalTitle);
            if (translatedTitle) {
                updateData.title = translatedTitle;
                updateData.originalTitle = originalTitle;
            }
        }

        await articleRef.update(updateData);
        return { success: true };

    } catch (error: any) {
        console.error(`Error summarizing article ${articleId}:`, error.message);
        return { success: false, error: error.message };
    }
}

export async function POST(req: NextRequest) {
    try {
        const { articleIds } = await req.json();

        if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
            return NextResponse.json({ error: 'articleIds array is required' }, { status: 400 });
        }

        const results: { id: string; success: boolean; error?: string }[] = [];

        // Process articles sequentially to avoid overwhelming the AI service
        for (const id of articleIds) {
            console.log(`Processing article: ${id}`);
            const result = await summarizeArticle(id);
            results.push({ id, ...result });

            // Small delay between requests to be gentle on AI service
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            total: articleIds.length,
            success: successCount,
            failed: failCount,
            results
        });

    } catch (error: unknown) {
        console.error('Bulk summarization error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500 }
        );
    }
}
