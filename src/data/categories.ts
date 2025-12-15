export interface Category {
  id: string;
  name: string;
  icon?: string; // Optional icon name
}

export const categories: Category[] = [
  { id: "all", name: "전체" },
  { id: "dev-blog", name: "개발/테크" },
  { id: "design-ux", name: "디자인/UX" },
  { id: "it-trend", name: "IT 트렌드" },
  { id: "marketing", name: "마케팅" },
  { id: "startup-vc", name: "스타트업/VC" },
  { id: "ai", name: "AI" },
  { id: "startup-support", name: "정책/지원" },
];