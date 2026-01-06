import { TrendReport } from "@/types/trends";

export const MOCK_TREND_REPORT: TrendReport = {
    id: "mock-1",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    totalArticles: 124,
    version: 1,
    topTags: [
        { tag: "AI", count: 45 },
        { tag: "React", count: 32 },
        { tag: "Next.js", count: 28 },
        { tag: "TailwindCSS", count: 20 },
        { tag: "TypeScript", count: 18 },
        { tag: "Server Actions", count: 15 },
        { tag: "RSC", count: 12 },
        { tag: "Vercel", count: 10 },
        { tag: "OpenAI", count: 8 },
        { tag: "Copilot", count: 7 },
    ],
    categoryDistribution: [
        { id: "dev-blog", label: "Dev Blog", count: 60 },
        { id: "tech-news", label: "Tech News", count: 40 },
        { id: "design", label: "Design", count: 15 },
        { id: "career", label: "Career", count: 9 },
    ],
    summary: "This week, AI integration in web development tools has been the dominant theme. Developers are increasingly adopting AI-powered coding assistants like GitHub Copilot and Cursor. Additionally, 'Server Actions' in Next.js 14 continue to generate significant discussion regarding best practices and security patterns.",
    emergingTopics: [
        "AI-Native IDEs",
        "React Compiler (React Forget)",
        "Edge Computing Patterns",
        "WebGPU Adoption"
    ]
};
