# TechHub PRD (Product Requirements Document)

## 1. 프로젝트 개요

### 1.1 프로젝트명
**TechHub** - 국내 기술·디자인·트렌드 커뮤니티 콘텐츠 통합 큐레이션 플랫폼

### 1.2 핵심 목표
8개 카테고리(개발·테크 블로그, 디자인·UX, 마케팅·트렌드, VC·스타트업, AI 트렌드, 앱 트렌드, AI 프롬프트, 스타트업 지원)의 **70개+ 사이트 글**을 한 곳에서 모아 읽을 수 있는 통합 큐레이션 플랫폼 구축

### 1.3 타겟 사용자
- 기술 관심층: 개발자, UI/UX 디자이너, 기획자, PM
- 창업/트렌드 관심층: 스타트업 창업자, 예비창업자
- 학습 목적: 최신 기술/시장 동향 수집자
- **연령**: 20대~50대 (직장인 중심)
- **국가**: 한국 (일부 글로벌 기술 정보 포함)

### 1.4 핵심 가치제안
| 문제점 | 솔루션 |
|--------|--------|
| 70개 사이트를 개별 방문 필요 | RSS 피드 기반 자동 수집 |
| 글들이 흩어져 있어 정보 누락 | 한 곳에서 통합 모니터링 |
| 카테고리 분류 없음 | 8개 카테고리 자동 분류 |
| 검색 어려움 | 통합 검색 + 필터링 기능 |
| 좋은 글을 놓칠 수 있음 | 북마크/저장 + 태깅 기능 |

---

## 2. RSS 피드 수집 가능성

### 2.1 조사 결과 요약
✅ **수집 가능**: 전체 70개 사이트 중 **약 65개(93%)가 RSS 지원**

### 2.2 확인된 RSS URL 샘플
#### 개발·테크 블로그
- NAVER D2: `https://d2.naver.com/d2.atom`
- Kakao Tech: `https://tech.kakao.com/feed/`
- Toss Tech: `https://toss.tech/rss.xml`
- 우아한형제들: `https://techblog.woowahan.com/feed`
- 쿠팡 Engineering: `https://medium.com/feed/coupang-engineering`

#### 디자인·UX
- pxd 인사이트: 블로그 피드 (확인 필요)
- Aurora: 블로그 피드 (확인 필요)

#### AI 트렌드
- OpenAI Blog: `https://openai.com/blog/rss`
- Google AI Blog: `https://ai.googleblog.com/feeds/posts/default`
- HuggingFace Blog: `https://huggingface.co/blog/rss.xml`

### 2.3 RSS 미지원 사이트 대체 방안
| 사이트 | 대체 방안 |
|--------|---------|
| Instagram/Pinterest 기반 사이트 | 소셜 미디어 API 연동 (추후) |
| 폐쇄형 블로그 (RSS 없음) | 웹크롤링 + 정규식 파싱 |
| API 기반 서비스 | 공식 API 활용 (MobileIndex 등) |

### 2.4 권장사항
🎯 **Phase 1**: RSS 지원하는 65개 사이트부터 시작
🎯 **Phase 2**: 웹크롤링 추가 지원
🎯 **Phase 3**: 소셜/API 연동

---

## 3. 기능 요구사항

### 3.1 코어 기능 (MVP - 최소 실행 가능 제품)

#### 기능 1: RSS 피드 자동 수집 및 표시
- **설명**: 등록된 RSS 피드에서 글 자동 수집 (1시간 주기)
- **세부 동작**:
  - 여러 RSS 피드의 최신 글 병렬 수집
  - 중복 글 제거 (URL 기반)
  - 최신순 정렬 (기본값)
  - 각 글 정보 표시: 제목, 요약, 출처, 작성일, 이미지
- **UI 요소**:
  - 카드 형식 리스트 (이미지/제목/요약/출처/날짜)
  - 페이지네이션 또는 무한 스크롤

#### 기능 2: 카테고리 분류 및 네비게이션
- **설명**: 8개 카테고리별 글 자동 분류 + 필터링
- **카테고리 구조**:
  ```
  1. 개발·테크 블로그 (20개 사이트)
  2. 디자인·UX 인사이트 (8개 사이트)
  3. 마케팅·트렌드·리포트 (8개 사이트)
  4. VC·스타트업 인사이트 (4개 사이트)
  5. AI 트렌드 인사이트 (12개 사이트)
  6. 앱 트렌드 인사이트 (5개 사이트)
  7. AI 프롬프트 인사이트 (6개 사이트)
  8. 스타트업 지원 (7개 사이트)
  ```
- **UI 요소**:
  - 좌측 사이드바 또는 상단 탭 네비게이션
  - "전체 보기" (All) 탭 기본값
  - 각 카테고리 클릭 → 해당 글만 필터링

#### 기능 3: 통합 검색 + 키워드 필터링
- **설명**: 제목·요약·출처 기반 실시간 검색
- **세부 동작**:
  - 키워드 입력 → 즉시 검색 결과 필터링
  - 검색 범위: 제목, 요약, 출처명 포함
  - AND 검색 지원 (예: "AI" + "프롬프트")
  - 검색어 강조 표시
- **UI 요소**:
  - 상단 검색창
  - 검색 히스토리 저장 (선택사항)

#### 기능 4: 북마크/저장 기능
- **설명**: 관심 글을 개인 저장소에 보관
- **세부 동작**:
  - 각 글마다 "♥ 저장" 버튼
  - 저장한 글 목록 별도 페이지 ("내 저장")
  - 저장 시간 표시
  - 로컬스토리지 기반 저장 (초기) 또는 Google Cloud Datastore
- **UI 요소**:
  - 하트 아이콘 토글
  - "내 저장" 상단 네비게이션 탭

#### 기능 5: 자동 태깅 및 태그 필터링
- **설명**: AI 기반 자동 태깅 + 사용자 정의 태그
- **세부 동작**:
  - 글 수집 시 자동 태깅 (예: "AI", "디자인", "핀테크", "창업")
  - 태그별 필터링 가능
  - 사용자가 태그 직접 추가/수정 가능
  - 인기 태그 클라우드 표시
- **AI 태깅 규칙** (초기):
  - 키워드 매칭 기반 (사이트명, 제목, 요약)
  - Gemini API 활용 자동 태깅 (추후)
- **UI 요소**:
  - 각 글 하단에 태그 배지 표시
  - "인기 태그" 섹션 (홈페이지 하단)
  - 태그 클릭 → 해당 태그 글만 필터링

#### 기능 6: 상세 글 뷰 및 원본 링크
- **설명**: 글 클릭 시 상세 정보 표시
- **세부 동작**:
  - 모달/새 페이지에서 글 상세 정보 표시
  - 제목, 요약, 이미지, 작성일, 출처, 태그 표시
  - "원본 보기" 버튼으로 원본 사이트 링크
  - 추가 추천 글 표시 (같은 카테고리/태그)
- **UI 요소**:
  - 글 클릭 → 모달 팝업
  - "원본 보기" CTA 버튼
  - 추천 글 섹션

---

### 3.2 Phase 2 기능 (고도화)

#### 기능 7: 뉴스레터/이메일 구독
- 주간/일간 큐레이션 이메일 발송
- 사용자 선택 카테고리 기반 맞춤 발송

#### 기능 8: 커뮤니티/공유 기능
- 저장한 글 공유 (링크)
- 사용자 북마크 컬렉션 공개/비공개 설정

#### 기능 9: 고급 필터링
- 날짜 범위 필터 (지난 1주, 1개월 등)
- 출처별 필터 (특정 회사 블로그만 보기)
- 인기도 정렬 (좋아요 많은 순, 공유 많은 순)

#### 기능 10: 다크 모드
- 사용자 테마 설정 (라이트/다크)

---

## 4. 기술 스택 및 아키텍처

### 4.1 Frontend (바이브 코딩)
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Tailwind CSS + Radix UI (기존 패턴 활용)
- **State Management**: Zustand (간단한 상태관리) 또는 Context API
- **HTTP Client**: fetch API 또는 axios
- **RSS Parser**: JS 기반 (feedparser-js, rss-parser)
- **스토리지**: localStorage (초기) → Google Cloud Firestore (확장)

### 4.2 Backend
- **Runtime**: Node.js (Google Cloud Run)
- **Framework**: Express.js 또는 Next.js API Routes
- **작업 스케줄**: Google Cloud Scheduler + Cloud Tasks
- **Database**: Google Cloud Firestore (NoSQL) 또는 Cloud SQL (PostgreSQL)
- **캐싱**: Redis (Google Cloud Memorystore) - 선택사항

### 4.3 Google Cloud 설정
```
┌─────────────────────────────────────┐
│  Frontend (Next.js on Cloud Run)    │
└──────────────┬──────────────────────┘
               │
      ┌────────▼────────┐
      │  Cloud Storage  │ (정적 파일)
      └────────┬────────┘
               │
      ┌────────▼────────────────┐
      │  API (Cloud Run)        │
      │  - RSS 수집             │
      │  - 글 저장/필터링       │
      └────────┬────────────────┘
               │
      ┌────────▼────────────────┐
      │  Firestore/SQL DB       │
      │  - 글 데이터            │
      │  - 사용자 데이터        │
      └────────┬────────────────┘
               │
      ┌────────▼────────────────┐
      │  Cloud Scheduler        │
      │  (1시간마다 RSS 수집)   │
      └─────────────────────────┘
```

### 4.4 API 설계 (백엔드 엔드포인트)
| 엔드포인트 | 메서드 | 기능 |
|-----------|--------|------|
| `/api/articles` | GET | 글 목록 (필터/검색 가능) |
| `/api/articles/:id` | GET | 글 상세 정보 |
| `/api/articles/save` | POST | 글 저장 (북마크) |
| `/api/articles/unsave` | DELETE | 저장 취소 |
| `/api/categories` | GET | 카테고리 목록 |
| `/api/tags` | GET | 태그 목록 + 인기 태그 |
| `/api/search` | GET | 통합 검색 |
| `/api/bookmarks` | GET | 사용자 저장 글 |
| `/api/stats` | GET | 대시보드 통계 (선택사항) |

---

## 5. 개발 우선순위 및 단계별 로드맵

### 5.1 우선순위 결정 기준
- **영향도 (Impact)**: 사용자 경험에 미치는 영향
- **복잡도 (Effort)**: 구현 난이도
- **학습곡선**: 바이브 코딩으로 구현 가능 여부

### 5.2 Phase별 개발 계획

#### **Phase 1: MVP (1-2주, 핵심 기능)**
**목표**: 최소 실행 가능 제품 출시 (유저 피드백 수집)

| 우선순위 | 기능 | 복잡도 | 예상 시간 | 상세 작업 |
|---------|------|--------|---------|---------|
| 1 | RSS 피드 수집 구조 | 중 | 3-4일 | RSS 피드 URL 관리 DB, 수집 로직 API |
| 2 | 글 목록 표시 | 낮 | 2-3일 | 카드 UI, 페이지네이션, 기본 정렬 |
| 3 | 카테고리 필터 | 낮 | 1-2일 | 사이드바 네비, 클릭 필터링 |
| 4 | 검색 기능 | 중 | 2-3일 | 검색 input, 클라이언트/서버 검색 로직 |
| 5 | 북마크/저장 | 낮 | 1-2일 | 하트 아이콘, localStorage 저장, "내 저장" 페이지 |

**Phase 1 산출물**:
- 배포된 웹앱 (techhub.example.com)
- 8개 카테고리 RSS 수집 중
- 검색 + 필터 + 북마크 기능 작동

**배포 환경**: Google Cloud Run + Cloud Storage

---

#### **Phase 2: 고도화 (1주, 품질 개선)**
**목표**: 사용자 피드백 반영, UX 개선

| 우선순위 | 기능 | 예상 시간 |
|---------|------|---------|
| 1 | 자동 태깅 (키워드 기반) | 2-3일 |
| 2 | 태그 필터링 + 태그 클라우드 | 1-2일 |
| 3 | 상세 글 뷰 모달 | 1-2일 |
| 4 | 다크 모드 | 1-2일 |
| 5 | 성능 최적화 + SEO | 1-2일 |

**Phase 2 산출물**:
- 자동 태깅 시스템
- 향상된 UX/UI
- SEO 최적화 (각 글별 메타태그)

---

#### **Phase 3: 확장 (2주+, 고급 기능)**
**목표**: 커뮤니티 및 개인화 기능 추가

| 기능 | 예상 시간 |
|------|---------|
| 사용자 계정 시스템 (Google 로그인) | 3-4일 |
| Firestore 데이터베이스 마이그레이션 | 2-3일 |
| 뉴스레터 구독 (이메일 발송) | 3-4일 |
| AI 기반 자동 태깅 (Gemini API) | 3-4일 |
| 모바일 앱 (PWA 또는 React Native) | 1-2주 |

---

### 5.3 핵심 기능 세부 구현 가이드

#### 기능 1: RSS 피드 수집 (백엔드)

**작동 흐름**:
```
1. RSS URL 리스트 정의 (config/feeds.json)
2. Cloud Scheduler 트리거 (1시간마다)
3. /api/feed-collector 엔드포인트 실행
4. 각 RSS 피드 파싱 (feedparser-js)
5. 글 데이터 추출 (title, link, summary, pubDate, image)
6. 중복 제거 (URL 기반)
7. Firestore에 저장
8. 태그 자동 생성
```

**구현 순서**:
1. RSS 피드 URL 관리 DB 구조 설계
2. Node.js 백엔드에서 RSS 파서 라이브러리 테스트
3. API 엔드포인트 구현
4. 시간 기반 트리거 설정 (Google Cloud Scheduler)

---

#### 기능 2: 프론트엔드 글 목록 표시

**UI 구조** (Next.js + Tailwind):
```tsx
// app/page.tsx - 홈페이지 (전체 글 목록)
// app/articles/page.tsx - 글 목록 페이지
// components/ArticleCard.tsx - 글 카드 컴포넌트
// components/CategoryNav.tsx - 카테고리 네비게이션
// components/SearchBar.tsx - 검색창
```

**데이터 흐름**:
```
User 클릭 → Next.js API Route (/api/articles)
→ Firestore 쿼리 (카테고리 필터)
→ 글 데이터 반환 → React 컴포넌트 렌더링
```

---

#### 기능 3: 검색 기능

**구현 옵션**:
- **Option A (간단)**: 클라이언트 검색 (프론트엔드 필터)
  - 모든 글을 메모리에 로드 후 필터링
  - 작은 데이터셋(<5000개) 적합
  
- **Option B (확장)**: 서버 검색 (백엔드 쿼리)
  - Firestore 또는 Elasticsearch 활용
  - 수백만 개 글 처리 시 필요

**권장사항**: Phase 1에서 Option A로 시작, Phase 3에서 Option B로 전환

---

#### 기능 4: 북마크 저장

**초기 구현 (localStorage)**:
```javascript
// 저장하기
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
bookmarks.push({ articleId, savedAt: new Date() });
localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

// 불러오기
const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
```

**확장 구현 (Firestore)**:
```javascript
// Firestore 컬렉션: users/{userId}/bookmarks/{articleId}
const userRef = db.collection('users').doc(currentUser.uid);
await userRef.collection('bookmarks').doc(articleId).set({
  articleId,
  savedAt: serverTimestamp(),
});
```

---

#### 기능 5: 자동 태깅

**Phase 1 구현** (키워드 기반):
```javascript
// config/tagRules.js
const tagRules = [
  { keywords: ['AI', '머신러닝', 'LLM', 'GPT'], tag: 'AI' },
  { keywords: ['디자인', 'UX', 'UI'], tag: '디자인' },
  { keywords: ['핀테크', '결제', '금융'], tag: '핀테크' },
  { keywords: ['스타트업', '창업', '벤처'], tag: '스타트업' },
  // ...
];

function autoTag(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  return tagRules
    .filter(rule => rule.keywords.some(kw => text.includes(kw.toLowerCase())))
    .map(rule => rule.tag);
}
```

**Phase 3 구현** (Gemini API):
```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const prompt = `
제목: "${article.title}"
요약: "${article.summary}"

위 글을 분류할 수 있는 3-5개의 태그를 생성하세요:
(예: AI, 디자인, 핀테크, 스타트업 등)
`;

const result = await model.generateContent(prompt);
const tags = result.response.text().split(',').map(t => t.trim());
```

---

## 6. 바이브 코딩 개발 워크플로우

### 6.1 개발 도구 및 환경
- **IDE**: VS Code + Copilot (또는 ChatGPT/Gemini)
- **디자인**: Figma (이미 구성한 디자인 시스템 활용)
- **Version Control**: GitHub
- **배포**: Google Cloud Console
- **테스트**: Chrome DevTools + Google Cloud Run 로그

### 6.2 바이브 코딩 체크리스트

#### 자산 수집 단계
```
□ Figma에서 컴포넌트 라이브러리 정리
  - ArticleCard, CategoryNav, SearchBar, Modal
  - 색상, 타이포그래피, 간격 (디자인 토큰)
  
□ Tailwind CSS 커스텀 설정
  - 기존 프로젝트 config 재활용
  
□ Radix UI 컴포넌트 확인
  - Dialog, Dropdown, Popover 등
```

#### 프로토타이핑 단계
```
□ 클론 코딩 (참고할 서비스)
  - Feedly, Slack (채널 형식)
  - LinkedIn 피드 (카드 레이아웃)
  
□ AI 프롬프트 작성
  - "다음 Figma 디자인을 Next.js + Tailwind로 구현해줘"
  - 프롬프트 예시 섹션 참고 (아래)
```

#### 구현 단계
```
□ 컴포넌트 분리
  - Layout, Header, Sidebar, MainContent
  - ArticleCard, CategoryNav, SearchBar
  - Modal, TagCloud
  
□ API 연결
  - /api/articles 테스트 (Mock 데이터로 시작)
  - 실제 데이터로 연결
  
□ 상태 관리 (Zustand)
  - selectedCategory, searchQuery, bookmarks
  - darkMode 토글
  
□ 반응형 디자인
  - 모바일 우선 (Tailwind responsive)
  - 테이블릿/데스크탑 레이아웃
```

---

### 6.3 AI 프롬프트 템플릿 (바이브 코딩)

#### 프롬프트 1: 컴포넌트 생성
```
**Context**:
- 프레임워크: Next.js 14 (App Router)
- UI: Tailwind CSS + Radix UI
- 디자인 시스템: [컬러, 폰트, 간격 참고]

**Task**:
다음 Figma 디자인을 Next.js 컴포넌트로 구현해줘.

**디자인 명세**:
- 컴포넌트명: ArticleCard
- 구조: 이미지 (왼쪽 33%) + 텍스트 (오른쪽 67%)
- 이미지 높이: 120px, border-radius: 8px
- 텍스트: 제목 (18px, semibold) + 요약 (14px, secondary) + 하단 정보 (12px, gray)
- 하단 정보: 출처 | 작성일 | 저장 버튼
- 호버 상태: 배경색 변화, 그림자 증가
- 태그: 제목 아래 배지 형태 (회색 배경)

**요구사항**:
- props: article (id, title, summary, image, source, pubDate, tags, bookmarked)
- onSave 콜백 함수
- 반응형 (모바일에서는 세로 레이아웃)
- 다크 모드 지원

**산출물**: 완전한 tsx 코드 (import 포함)
```

#### 프롬프트 2: 검색 + 필터 로직
```
**Task**:
Next.js에서 검색창과 필터링을 구현해줘.

**요구사항**:
- 검색창: 제목, 요약, 출처 포함
- 필터: 카테고리 (드롭다운) + 태그 (멀티셀렉트)
- 리셋 버튼
- URL에 query params 저장 (검색 상태 유지)
  예: ?search=AI&category=dev-blog&tags=AI,머신러닝

**상태 관리**: Zustand 사용
- store 구조: { search, selectedCategory, selectedTags, setSearch, ... }

**산출물**: 
1. /lib/store.ts (Zustand store)
2. /components/SearchFilter.tsx (UI)
3. /components/ArticleList.tsx (필터링된 표시)
```

#### 프롬프트 3: Google Cloud 연결
```
**Task**:
Next.js API Route에서 Google Cloud Firestore 연결해줘.

**요구사항**:
- Firestore 컬렉션 구조:
  articles/
    ├── {articleId}
    │   ├── title
    │   ├── link
    │   ├── summary
    │   ├── image
    │   ├── source
    │   ├── pubDate
    │   ├── tags[]
    │   └── category

- API 엔드포인트:
  GET /api/articles?category=xxx&search=xxx
  → 필터된 글 목록 반환

**환경 변수**:
- NEXT_PUBLIC_FIREBASE_CONFIG (공개)
- FIREBASE_ADMIN_SDK_KEY (비공개)

**산출물**:
1. lib/firebase.ts (클라이언트 SDK 초기화)
2. lib/firebaseAdmin.ts (관리자 SDK)
3. app/api/articles/route.ts (API 엔드포인트)
```

#### 프롬프트 4: RSS 수집 백엔드
```
**Task**:
Node.js/Express에서 RSS 피드를 수집하고 Firestore에 저장해줘.

**요구사항**:
- RSS 파서: feedparser-js 또는 rss-parser
- 피드 URL 소스: config/feeds.json
- 수집 로직:
  1. 각 RSS 피드 병렬 파싱
  2. 글 데이터 추출
  3. 중복 제거 (기존 Firestore와 비교)
  4. 새 글만 저장
  5. 자동 태깅 (키워드 기반)
  6. 타임스탬프 기록

- 에러 처리: 개별 피드 실패해도 다른 피드는 계속 수집

**산출물**:
1. lib/rss-collector.js (메인 로직)
2. app/api/feed-collector/route.ts (Cloud Run 엔드포인트)
3. config/feeds.json (피드 설정)
4. cron 설정 (Google Cloud Scheduler)
```

#### 프롬프트 5: 북마크 기능
```
**Task**:
북마크 저장/불러오기 기능을 구현해줘. (localStorage → Firestore 확장 가능)

**Phase 1 (localStorage)**:
- 저장: /components/ArticleCard에 "저장" 버튼
- 불러오기: /app/bookmarks/page.tsx에서 로컬 북마크 표시

**Phase 2 (Firestore)**:
- 사용자 계정 연동 (Google 로그인)
- Firestore: users/{userId}/bookmarks/{articleId}
- API: 
  POST /api/bookmarks (저장)
  DELETE /api/bookmarks/:id (삭제)
  GET /api/bookmarks (조회)

**산출물**:
1. hooks/useBookmarks.ts (커스텀 훅)
2. /app/bookmarks/page.tsx (북마크 페이지)
3. API 엔드포인트
```

---

## 7. 데이터 모델 및 Firestore 구조

### 7.1 컬렉션 설계

```
Firestore Database
├── feeds/
│   ├── dev-blog-001
│   │   ├── name: "NAVER D2"
│   │   ├── rssUrl: "https://d2.naver.com/d2.atom"
│   │   ├── category: "dev-blog"
│   │   ├── active: true
│   │   └── lastFetched: Timestamp
│   └── ...
│
├── articles/
│   ├── {articleId}
│   │   ├── title: string
│   │   ├── link: string (원본 URL)
│   │   ├── summary: string
│   │   ├── image: string (URL)
│   │   ├── source: string ("NAVER D2")
│   │   ├── sourceId: string ("dev-blog-001")
│   │   ├── category: string ("dev-blog", "design", etc.)
│   │   ├── pubDate: Timestamp
│   │   ├── tags: array ("AI", "디자인", ...)
│   │   ├── createdAt: Timestamp
│   │   ├── updatedAt: Timestamp
│   │   └── featured: boolean (에디터 추천)
│   └── ...
│
├── users/
│   ├── {userId}
│   │   ├── email: string
│   │   ├── name: string
│   │   ├── avatar: string
│   │   ├── preferences: {
│   │   │   ├── categories: array
│   │   │   ├── darkMode: boolean
│   │   │   └── emailNotifications: boolean
│   │   │}
│   │   ├── createdAt: Timestamp
│   │   └── lastLogin: Timestamp
│   │
│   └── {userId}/bookmarks/
│       ├── {articleId}
│       │   ├── articleId: string
│       │   ├── savedAt: Timestamp
│       │   └── userNotes: string (선택사항)
│       └── ...
│
└── categories/
    ├── dev-blog
    │   ├── name: "개발·테크 블로그"
    │   ├── icon: "code"
    │   ├── color: "#3B82F6"
    │   ├── feedCount: 20
    │   └── description: "..."
    └── ...
```

### 7.2 인덱스 설정
```
인덱스 1: articles { category, pubDate DESC }
인덱스 2: articles { tags, pubDate DESC }
인덱스 3: articles { sourceId, pubDate DESC }
인덱스 4: users/{userId}/bookmarks { savedAt DESC }
```

---

## 8. 보안 및 규정 준수

### 8.1 보안 고려사항
- **인증**: Google OAuth 2.0 (Google Sign-In)
- **권한**: Firestore Security Rules
  ```javascript
  // 사용자는 자신의 북마크만 읽기/쓰기 가능
  match /users/{userId}/bookmarks/{document=**} {
    allow read, write: if request.auth.uid == userId;
  }
  
  // 모든 사용자는 articles 읽기만 가능
  match /articles/{document=**} {
    allow read: if request.auth != null;
  }
  ```
- **API 레이트 제한**: Cloud Endpoints 또는 middleware 사용
- **환경 변수**: .env.local 파일 (공개 키/비밀 키 분리)

### 8.2 개인정보보호
- GDPR/CCPA 준수 (이메일 구독 동의)
- 사용자 데이터 암호화 (전송 중/저장 중)
- 로그 데이터 저장 정책 (3개월 → 삭제)

---

## 9. 성능 및 최적화

### 9.1 최적화 전략
| 영역 | 전략 |
|------|------|
| **로딩 속도** | Next.js Image 최적화, 동적 import (lazy loading) |
| **API 응답** | Firestore 인덱스, 페이지네이션 (20-50개/페이지) |
| **캐싱** | Redis (Google Cloud Memorystore), ISR (Incremental Static Regeneration) |
| **번들 크기** | Tree shaking, 코드 스플리팅 |
| **DB 쿼리** | 복합 인덱스, 쿼리 최적화 |

### 9.2 성능 목표
- **First Contentful Paint (FCP)**: < 2초
- **Largest Contentful Paint (LCP)**: < 2.5초
- **Cumulative Layout Shift (CLS)**: < 0.1
- **API 응답 시간**: < 500ms
- **Lighthouse 점수**: > 90

---

## 10. 배포 및 운영

### 10.1 배포 파이프라인
```
GitHub (소스코드)
    ↓
GitHub Actions (자동화 테스트)
    ↓
Google Cloud Build (빌드)
    ↓
Google Cloud Run (프로덕션 배포)
    ↓
Cloud CDN (캐싱/배포)
```

### 10.2 모니터링 및 로깅
- **Monitoring**: Google Cloud Monitoring (메모리, CPU, 요청 수)
- **Logging**: Cloud Logging (애플리케이션 로그, 에러 추적)
- **Error Tracking**: Google Cloud Error Reporting
- **분석**: Google Analytics 4 (사용자 행동)

### 10.3 비용 추정 (월간, 초기 단계)
| 서비스 | 예상 비용 |
|--------|---------|
| Cloud Run | $10-20 (요청 기반) |
| Firestore | $5-10 (읽기/쓰기) |
| Cloud Scheduler | ~$0.40 (작업 1개) |
| Cloud Storage | ~$0.50 (이미지 저장) |
| Cloud CDN | ~$1-5 (트래픽 기반) |
| **합계** | **$20-40/월** |

---

## 11. 성공 지표 (KPI)

### 11.1 초기 (Phase 1-2)
- **활성 사용자 수 (MAU)**: 100+ (3개월)
- **글 수집 수**: 500+/주
- **평균 세션 시간**: 5+ 분
- **검색 활용도**: 30% 이상 사용자
- **북마크율**: 글당 평균 5% 이상

### 11.2 중기 (Phase 3+)
- **MAU**: 1,000+
- **구독자**: 200+
- **NPS (Net Promoter Score)**: 40+
- **재방문율**: 40% 이상

---

## 12. 위험 요소 및 대응 전략

| 위험 | 가능성 | 영향 | 대응 전략 |
|------|--------|------|---------|
| RSS 피드 변경/중단 | 중 | 높음 | 모니터링 알림, 백업 수집 방법 준비 |
| Google Cloud 비용 증가 | 중 | 중간 | 쿼리 최적화, 캐싱 강화 |
| 사용자 이탈 | 중 | 높음 | UX 개선, 뉴스레터 engagement 지표 모니터링 |
| 보안 침해 | 낮음 | 매우 높음 | 정기 보안 감시, SSL/TLS, Firestore 규칙 검증 |
| 서버 다운타임 | 낮음 | 높음 | 다중 리전 배포 (추후), 헬스체크 |

---

## 13. 다음 단계

### 13.1 즉시 액션 (이번주)
- [ ] RSS 피드 URL 완전 정리 (70개 사이트 모두)
- [ ] Google Cloud 프로젝트 생성
- [ ] Figma에서 와이어프레임/프로토타입 제작
- [ ] 팀 킥오프 (if 팀 규모 있다면)

### 13.2 1주일 내
- [ ] 개발 환경 구성 (Next.js, Tailwind, 로컬)
- [ ] RSS 파서 테스트 (mock 데이터)
- [ ] Firestore 구조 최종 확정
- [ ] 첫 AI 프롬프트 작성 및 테스트

### 13.3 2주 내
- [ ] MVP 기능 50% 완성 (Phase 1 진행)
- [ ] 내부 베타 테스트 시작
- [ ] 반복 피드백

---

## 부록 A: RSS 피드 URL 전체 목록

### 개발·테크 블로그
```
https://d2.naver.com/d2.atom
https://tech.kakao.com/feed/
https://toss.tech/rss.xml
https://techblog.woowahan.com/feed
https://medium.com/feed/coupang-engineering
... (15개 더)
```

### 디자인·UX 인사이트
```
(개별 확인 필요 - 일부 RSS 미지원)
```

### AI 트렌드
```
https://openai.com/blog/rss
https://ai.googleblog.com/feeds/posts/default
https://huggingface.co/blog/rss.xml
... (9개 더)
```

---

## 부록 B: 바이브 코딩 리소스 링크

| 도구 | 링크 | 용도 |
|------|------|------|
| Figma | https://figma.com | 디자인/프로토타입 |
| Next.js Docs | https://nextjs.org/docs | 개발 가이드 |
| Tailwind CSS | https://tailwindcss.com | 스타일링 |
| Radix UI | https://radix-ui.com | UI 컴포넌트 |
| Firebase Docs | https://firebase.google.com/docs | Google Cloud 연동 |
| Zustand | https://github.com/pmndrs/zustand | 상태관리 |
| ChatGPT/Gemini | https://chat.openai.com | 코드 생성 |

---

**문서 작성일**: 2025년 12월 4일
**버전**: 1.0
**작성자**: TechHub Product Team
**최종 검토**: 필요시 업데이트
