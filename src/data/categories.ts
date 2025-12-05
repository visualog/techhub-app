export interface Category {
  id: string;
  name: string;
  icon?: string; // Optional icon name
}

export const categories: Category[] = [
  { id: "all", name: "전체 보기" },
  { id: "dev-blog", name: "개발·테크 블로그" },
  { id: "design-ux", name: "디자인·UX 인사이트" },
  { id: "marketing-trend", name: "마케팅·트렌드·리포트" },
  { id: "vc-startup", name: "VC·스타트업 인사이트" },
  { id: "ai-trend", name: "AI 트렌드 인사이트" },
  { id: "app-trend", name: "앱 트렌드 인사이트" },
  { id: "ai-prompt", name: "AI 프롬프트 인사이트" },
  { id: "startup-support", name: "스타트업 지원" },
];
