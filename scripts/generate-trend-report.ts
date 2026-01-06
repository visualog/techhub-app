import './env-setup';
import { db } from '../src/lib/firebaseAdmin';
import { generateText } from '../src/lib/ai-provider';
import { categories } from '../src/data/categories';
import { TrendReport, TagCount, CategoryDistribution } from '../src/types/trends';

// Configuration
const LOOKBACK_DAYS = 7;
const MIN_ARTICLES_FOR_ANALYSIS = 5;

async function generateTrendReport() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    console.log(`Starting Trend Analysis for last ${LOOKBACK_DAYS} days...`);

    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - LOOKBACK_DAYS);

    // 1. Fetch Articles
    // Note: This reads documents, so it consumes quota.
    const snapshot = await db.collection('articles')
        .where('pubDate', '>=', pastDate)
        .orderBy('pubDate', 'desc')
        .get();

    if (snapshot.empty) {
        console.log("No articles found in the last 7 days.");
        return;
    }

    const articles = snapshot.docs.map(doc => doc.data());
    console.log(`Fetched ${articles.length} articles.`);

    if (articles.length < MIN_ARTICLES_FOR_ANALYSIS) {
        console.log("Not enough articles for meaningful analysis.");
        // We might still proceed or exit. Let's exit to save AI tokens.
        return;
    }

    // 2. Statistics Calculation
    const tagMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};

    articles.forEach(article => {
        // Tags
        if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach((tag: string) => {
                const normalizedTag = tag.toLowerCase().trim();
                if (normalizedTag) {
                    tagMap[normalizedTag] = (tagMap[normalizedTag] || 0) + 1;
                }
            });
        }

        // Category
        if (article.category) {
            categoryMap[article.category] = (categoryMap[article.category] || 0) + 1;
        }
    });

    const topTags: TagCount[] = Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15); // Top 15

    const categoryDistribution: CategoryDistribution[] = Object.entries(categoryMap)
        .map(([id, count]) => {
            const categoryDef = categories.find(c => c.id === id);
            return {
                id,
                label: categoryDef ? categoryDef.name : id,
                count
            };
        })
        .sort((a, b) => b.count - a.count);

    // 3. AI Analysis
    console.log("Requesting AI for insights...");

    // Prepare a concise input for AI (Titles + Top Tags)
    const articlesPreview = articles.slice(0, 50).map(a => `- ${a.title}`).join('\n');
    const topTagsStr = topTags.slice(0, 10).map(t => `${t.tag} (${t.count})`).join(', ');

    const prompt = `
Analyze the following tech articles from the past week and provide a trend report in Korean.

[Data Context]
Top Keywords: ${topTagsStr}
Recent Article Titles:
${articlesPreview}

[Instructions]
1. summarized_trend: Write a 3-5 sentence professional summary of the week's tech trends. Focus on what technologies or topics are gaining attention.
2. emerging_topics: List 3-5 emerging topics or specific technologies mentioned.

Response format:
Summarized Trend: <text>
Emerging Topics: <comma separated list>
  `.trim();

    let aiSummary = "AI analysis check failed.";
    let emergingTopics: string[] = [];

    try {
        const aiResponse = await generateText(prompt);
        if (aiResponse) {
            // Simple parsing (could be robustified)
            const summaryMatch = aiResponse.match(/Summarized Trend:\s*([\s\S]*?)(?=\nEmerging Topics:|$)/i);
            const topicsMatch = aiResponse.match(/Emerging Topics:\s*(.*)/i);

            aiSummary = summaryMatch ? summaryMatch[1].trim() : aiResponse;
            if (topicsMatch) {
                emergingTopics = topicsMatch[1].split(',').map(s => s.trim());
            }
        }
    } catch (e) {
        console.error("AI Generation failed:", e);
    }

    // 4. Save Report
    const report: TrendReport = {
        startDate: pastDate.toISOString(),
        endDate: now.toISOString(),
        createdAt: new Date().toISOString(),
        totalArticles: articles.length,
        topTags,
        categoryDistribution,
        summary: aiSummary,
        emergingTopics,
        version: 1
    };

    // Use a predictable ID for "latest" or just add new
    // We'll add new to keep history, and maybe update a 'latest' doc pointer?
    // Let's just add to collection.
    const res = await db.collection('trends').add(report);
    console.log(`Trend report generated and saved: ${res.id}`);
}

generateTrendReport().catch(console.error);
