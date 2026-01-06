
export interface TagCount {
    tag: string;
    count: number;
}

export interface CategoryDistribution {
    id: string; // e.g., 'dev-blog'
    label: string; // e.g., 'Tech Blog'
    count: number;
}

export interface TrendReport {
    id?: string;
    startDate: string; // ISO Date string
    endDate: string; // ISO Date string
    createdAt: string; // ISO timestamp

    // Statistics
    totalArticles: number;
    topTags: TagCount[]; // Top 10-20 tags
    categoryDistribution: CategoryDistribution[];

    // AI Insights
    summary: string; // "This week, AI Agents were dominant..."
    emergingTopics: string[]; // List of rising topics

    // Metadata
    version: number; // For schema versioning
}
