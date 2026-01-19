export interface Article {
  id: string;
  title: string;
  link: string;
  summary: string;
  image?: string;
  source: string;
  sourceId: string;
  category: string;
  pubDate: string; // Using string for simplicity in mock data
  tags: string[];
  bookmarked?: boolean;
  isVideo?: boolean;
  status?: 'pending' | 'published' | 'rejected';
  originalTitle?: string;
}

export const mockArticles: Article[] = [
  {
    id: "toss-tech-1",
    title: "TossSLASH 23: 다시 한 번 파도가 되어",
    link: "https://toss.tech/article/toss-slash-23",
    summary: "지난 6월, 토스커뮤니티의 기술 컨퍼런스 ‘SLASH 23’이 막을 내렸습니다. ‘다시 한 번 파도가 되어’라는 슬로건과 함께 역대급 규모로 찾아왔는데요. 3년 만에 오프라인으로 열린 이번 컨퍼런스, 어떤 순간들이 있었는지 토스씨엑스 팀이 소개해 드려요.",
    image: "https://wp.toss.tech/wp-content/uploads/2023/07/toss-slash-23-final-kv.png",
    source: "Toss Tech",
    sourceId: "dev-blog-003",
    category: "dev-blog",
    pubDate: "2023-07-12T00:00:00Z",
    tags: ["Conference", "Toss", " SLASH 23"],
    bookmarked: false,
  },
  {
    id: "kakao-tech-1",
    title: "if(kakao)dev2023 클라우드 세션 다시보기",
    link: "https://tech.kakao.com/2023/12/12/if-kakao-dev-2023-cloud-session/",
    summary: "지난 11월에 진행된 if(kakao)dev2023! 올해는 ‘새로운 연결을 위한 다양한 상상’이라는 주제로 많은 분들이 참여해주셨는데요, 다양한 세션 중 클라우드 기술 관련 세션을 모아 소개해 드립니다.",
    image: "https://t1.kakaocdn.net/kakaocorp/if-kakao/2023/web/og/og-ifkakao-2023.png",
    source: "Kakao Tech",
    sourceId: "dev-blog-002",
    category: "dev-blog",
    pubDate: "2023-12-12T00:00:00Z",
    tags: ["if(kakao)", "Cloud", "Conference"],
    bookmarked: true,
  },
  {
    id: "openai-blog-1",
    title: "GPT-4o",
    link: "https://openai.com/index/hello-gpt-4o/",
    summary: "Our new flagship model, GPT-4o, can respond to audio inputs in as little as 232 milliseconds, with an average of 320 milliseconds, which is similar to human response time in a conversation.",
    image: "https://images.openai.com/blob/8d45f329-5717-4638-a153-b54133d59a72/gpt-4o-and-a-woman-solving-a-math-problem.jpg",
    source: "OpenAI Blog",
    sourceId: "ai-trend-001",
    category: "ai-trend",
    pubDate: "2024-05-13T00:00:00Z",
    tags: ["GPT-4o", "LLM", "AI"],
    bookmarked: false,
  },
  {
    id: "d2-naver-1",
    title: "HyperCLOVA X 기술 리포트",
    link: "https://d2.naver.com/helloworld/112342",
    summary: "네이버의 초대규모 AI, HyperCLOVA X의 기술적 도전과 경험을 공유합니다. 모델링, 데이터, 학습, 튜닝, 서비스 적용 등 다양한 측면에서 어떤 고민을 했는지 살펴보세요.",
    source: "NAVER D2",
    sourceId: "dev-blog-001",
    category: "dev-blog",
    pubDate: "2024-02-20T00:00:00Z",
    tags: ["HyperCLOVA X", "AI", "LLM"],
    bookmarked: false,
  },
];
