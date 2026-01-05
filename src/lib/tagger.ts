
// src/lib/tagger.ts

interface TagRule {
    keywords: string[];
    tag: string;
}

// Order matters: specific keywords should come before general ones if needed,
// though current logic dedups tags so order is less critical for correctness,
// but important for priority if we limit tag count.
const TAG_RULES: TagRule[] = [
    // --- Languages & Frameworks ---
    { keywords: ['react', 'next.js', 'nextjs', 'typescript', 'javascript', 'frontend', '프론트엔드'], tag: 'Frontend' },
    { keywords: ['node.js', 'nodejs', 'nest.js', 'nestjs', 'express', 'backend', '백엔드', 'java', 'spring', 'kotlin'], tag: 'Backend' },
    { keywords: ['python', 'django', 'fastapi', 'flask'], tag: 'Python' },
    { keywords: ['swift', 'ios', 'android', 'kotlin', 'flutter', 'react native', '모바일'], tag: 'Mobile' },

    // --- AI & Data ---
    { keywords: ['ai', 'artificial intelligence', '인공지능', 'llm', 'gpt', 'generative ai', '생성형 ai', 'machine learning', '머신러닝', 'deep learning', '딥러닝'], tag: 'AI' },
    { keywords: ['prompt', '프롬프트'], tag: 'Prompt' },
    { keywords: ['data', '데이터', 'big data', '빅데이터', 'analysis', '분석'], tag: 'Data' },

    // --- Infrastructure & DevOps ---
    { keywords: ['aws', 'cloud', '클라우드', 'azure', 'gcp', 'devops', 'docker', 'kubernetes', 'k8s', 'infra', '인프라'], tag: 'DevOps' },
    { keywords: ['security', '보안'], tag: 'Security' },

    // --- Design & UX ---
    { keywords: ['ux', 'ui', 'user experience', 'design', '디자인', 'figma', 'sketch', 'adobe'], tag: 'Design' },
    { keywords: ['interaction', '인터랙션', 'animation', '애니메이션'], tag: 'Interaction' },

    // --- Business & Startup ---
    { keywords: ['startup', '스타트업', 'vc', 'venture', 'investment', '투자', 'entrepreneur', '창업'], tag: 'Startup' },
    { keywords: ['marketing', '마케팅', 'branding', '브랜딩', 'growth', '그로스'], tag: 'Marketing' },
    { keywords: ['pm', 'product manager', '기획', 'service'], tag: 'PM/PO' },

    // --- Trends & Other ---
    { keywords: ['trend', '트렌드', 'insight', '인사이트'], tag: 'Trend' },
    { keywords: ['career', '커리어', '취업', '이직', 'interview', '면접'], tag: 'Career' },
];

export function generateTags(title: string, summary: string = ''): string[] {
    const text = `${title} ${summary}`.toLowerCase();
    const tags = new Set<string>();

    for (const rule of TAG_RULES) {
        // Check if any keyword in the rule exists in the text
        const matched = rule.keywords.some(keyword => {
            // Simple includes check - can be improved with regex for word boundaries if needed
            // ensuring we don't match substrings incorrectly (e.g. "java" in "javascript" is tricky without word boundaries)
            // For now, simpler is faster. "javascript" contains "script", but usually we want distinct tags.
            // Let's use a regex with word boundaries for English keywords to be safer?
            // Actually, for Korean/mixed, includes is often safer/easier. 
            // Let's stick to includes for simplicity in Phase 1, but be careful with short keywords.
            return text.includes(keyword.toLowerCase());
        });

        if (matched) {
            tags.add(rule.tag);
        }
    }

    return Array.from(tags);
}
