// scripts/update-feeds-from-bookmarks.ts
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

interface Feed {
  id: string;
  name: string;
  rssUrl: string; // For now, we'll store the main URL here if no explicit RSS feed is found
  category: string;
}

interface ParsedBookmark {
  name: string;
  url: string;
  category: string;
}

const FEEDS_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'feeds.json');
const NON_RSS_SOURCES_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'non-rss-sources.json');

const markdownContent = `
# Tech 북마크 정리 (총 56개)

## 🤖 AI (4개)

1. [CLOVA Tech Blog](https://clova.ai/tech-blog) - 네이버 클로바 AI 기술 블로그
2. [VCAT.AI Blog](https://vcat.ai/blog) - VCAT AI 블로그
3. [OpenAI Global Affairs](https://openai.com/news/global-affairs) - OpenAI 뉴스룸
4. [Google Blog 한국](https://blog.google/intl/ko-kr/) - 구글 공식 블로그 한국어판

---

## 💻 개발/테크 (10개)

### 국내 기술 블로그
1. [NAVER D2](https://d2.naver.com/home) - 네이버 개발자 기술 블로그
2. [kakao tech](https://tech.kakao.com/posts/798) - 카카오 기술 블로그
3. [toss tech](https://toss.tech) - 토스 기술 블로그
4. [달파 블로그](https://app.dalpha.so/blog) - 기술 블로그
5. [우아한형제들 기술블로그](https://techblog.woowahan.com) - 배달의민족 기술 블로그
6. [쿠팡 Engineering Blog](https://www.coupang.jobs/kr/life-at-coupang/engineering-blog) - 쿠팡 엔지니어링
7. [쿠팡 Engineering Medium](https://medium.com/coupang-engineering) - 쿠팡 엔지니어링 미디엄
8. [d2sf.naver](https://d2sf.naver.com) - 네이버 D2 Startup Factory

### 기술 블로그 플랫폼
9. [TechBlogPosts](https://www.techblogposts.com/ko) - 기술 블로그 포스트 모음 (한글)
10. [44BITS](https://www.44bits.io/ko/keyword/engineering-blog) - 엔지니어링 블로그 키워드 모음

### 공공 데이터
11. [공공데이터포털](https://www.data.go.kr/) - 대한민국 공공데이터

---

## 🎨 디자인/UX (29개)

### 디자인 커뮤니티 & 포털
1. [디자인코리아](https://design.co.kr/) - 한국 디자인 종합 포털
2. [굿디자인웹](https://www.gdweb.co.kr/main/) - 웹 디자인 쇼케이스

### 디자인 리소스 & 학습
3. [Figmapedia](https://www.figmapedia.com) - Figma 백과사전
4. [Design Compass Magazine](https://designcompass.org/magazine) - 디자인 매거진
5. [What was IT](https://wwit.design) - IT 디자인 히스토리

### 디자인 블로그 & 커뮤니티
6. [UI Bowl](https://uibowl.io) - UI/UX 디자인 갤러리 및 패턴
7. [pxd Insights](https://pxd.co.kr/insights) - pxd 인사이트
8. [Lemon Design (TISTORY)](https://lemondesign.tistory.com/65) - 레몬 디자인 블로그
9. [Lifeboosta UX 디자인](https://lifeboosta.com/entry/UI-UX-디자인-포트폴리오-사이트-모음-2024) - UI/UX 디자인 포트폴리오 사이트 모음 2024
10. [Rightbrain Blog](https://brunch.co.kr/@rightbrain) - UI/UX 디자인 패턴 아카이브
11. [Rightbrain Archive](https://blog.rightbrain.co.kr) - UI/UX 패턴 아카이브

### 디자인 학습 & 튜토리얼
12. [Canva Learn](https://www.canva.com/ko_kr/learn) - Canva 학습 센터
13. [Pinterest Create Blog](https://create.pinterest.com/ko/blog) - Pinterest 크리에이트 블로그
14. [Dribbble Stories](https://dribbble.com/stories) - Dribbble 디자인 블로그
15. [Awwwards Blog](https://www.awwwards.com/blog/all) - 웹 디자인 어워드 블로그
16. [Spline Blog](https://blog.spline.design) - 3D 디자인 블로그
17. [Discord Blog Community](https://discord.com/blog) - Discord 커뮤니티 블로그
18. [Discord Blog Category](https://discord.com/category/community) - Discord 블로그 커뮤니티 카테고리
19. [Muz.li](https://medium.muz.li) - 디자인 인스피레이션
20. [Abduzeedo](https://abduzeedo.com/node?page=1) - 디자인 인스피레이션 & UX 커리어
21. [Designlab Blog](https://designlab.com/blog/top-ux-design-blogs) - 탑 UX 디자인 블로그 (2025 업데이트)
22. [A List Apart - Interaction Design](https://alistapart.com/blog/topic/interaction-design) - 인터랙션 디자인
23. [Creative Market Blog](https://creativemarket.com/blog) - 디자인 아티클, 인스피레이션
24. [Codrops](https://tympanus.net/codrops) - 웹 크리에이티비티 (2009년부터)
25. [Creative Boom](https://www.creativeboom.com) - 크리에이티브 산업 매거진
26. [UX Planet](https://uxplanet.org) - UX 디자인
27. [UX Collective](https://uxdesign.cc) - UX 디자인 커뮤니티
28. [It's Nice That](https://www.itsnicethat.com) - 디자인 매거진
29. [Justinmind Blog](https://www.justinmind.com/blog) - Justinmind UX 블로그

### 3D & 모션 디자인
30. [GSAP Showcase](https://gsap.com/showcase) - GSAP 애니메이션 쇼케이스
31. [Motion.dev Blog](https://motion.dev/blog) - 모션 디자인 블로그

---

## 📱 IT 트렌드 (7개)

1. [공감나우 IT 기술 트렌드](https://hongong.hanbit.co.kr/공감나우-it-기술-기업-블로그-트렌드-리포트-모음-zip) - IT 기술 기업 트렌드 리포트 2024
2. [Fficial NAVER](https://fficial.naver.com/contents/All) - 네이버 공식 콘텐츠
3. [오픈서베이 트렌드 리포트](https://blog.opensurvey.co.kr/category/trendreport) - 트렌드 리포트
4. [Cheil Magazine Insight](https://magazine.cheil.com/category/insight) - 제일기획 인사이트
5. [Brunch 모비인사이드](https://brunch.co.kr/@mobiinside) - 모바일 인사이트
6. [Brunch +X](https://brunch.co.kr/@plusx) - IT 인사이트
7. [Brunch pliossun](https://brunch.co.kr/@pliossun) - IT/테크 인사이트

---

## 💼 마케팅 (4개)

1. [6개월치 마케팅 사이클](https://blog.effic.biz/trendreport) - CRM 블로그
2. [나스미디어 10월 트렌드](https://blog.nasmedia.co.kr/entry/2025/10-trendissue-media1) - 미디어 트렌드 이슈
3. [Effic 트렌드 리포트](https://blog.effic.biz/trendreport) - 마케팅 트렌드
4. [소셜마켓 블로그](https://blog.socialmkt.co.kr) - 소셜 마케팅

---

## 🚀 스타트업/VC (1개)

1. [kakao ventures blog](https://www.kakao.vc/blog) - 카카오벤처스 블로그

---

## 📋 정책/지원 (1개)

1. [공공데이터포털](https://www.data.go.kr/) - 정부 공공데이터 제공

---

## 📊 카테고리별 요약

| 카테고리 | 개수 | 비율 |
|---------|------|------|
| 디자인/UX | 29개 | 51.8% |
| 개발/테크 | 10개 | 17.9% |
| IT 트렌드 | 7개 | 12.5% |
| AI | 4개 | 7.1% |
| 마케팅 | 4개 | 7.1% |
| 스타트업/VC | 1개 | 1.8% |
| 정책/지원 | 1개 | 1.8% |
| **합계** | **56개** | **100%** |

---

## 💡 특징 분석

### 강점 분야
- **디자인/UX 중심** (51.8%): 해외 유명 디자인 블로그/매거진 + 국내 디자인 포털 종합
- **국내 빅테크 기술 블로그**: 네이버, 카카오, 토스, 쿠팡, 배민 등 주요 기업 완비
- **브런치 큐레이션**: IT/디자인 분야 양질의 필진 팔로우
- **글로벌 AI 동향**: 구글, OpenAI, 네이버 클로바 등 주요 AI 기업 추적

### 활용 가능성
- **사이드 프로젝트**: 공공데이터 활용, AI 통합, 디자인 시스템 구축
- **기술 트렌드 파악**: 국내외 주요 기업 기술 블로그 구독
- **디자인 인스피레이션**: 다양한 디자인 리소스로 UI/UX 작업 시 참고
- **마케팅 인사이트**: 트렌드 리포트로 시장 동향 파악

---

*최종 업데이트: 2025년 12월 19일*
