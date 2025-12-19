# 현재 진행 상황 및 다음 계획: 북마크 기반 피드 목록 업데이트 정확성 개선

## 1. 현재 문제점

`npm run update-feeds-from-bookmarks` 스크립트를 실행했을 때, 다음과 같은 문제들이 지속되고 있습니다.

*   **카테고리 매핑 문제:** `Category "🤖 AI" not found in CATEGORY_MAP, defaulting to "-ai"` 와 같이 카테고리 ID가 올바르게 매핑되지 않고 있습니다. Markdown 파일의 카테고리 헤더(예: "## 🤖 AI (4개)")에서 정확한 카테고리 이름을 추출하는 로직이 부족합니다.
*   **RSS URL 추론 부족:** `src/data/non-rss-sources.json`에 여전히 많은 주요 블로그 URL이 RSS 피드로 감지되지 않고 남아 있습니다. `guessRssUrl` 함수에 특정 플랫폼(예: clova.ai, openai.com, blog.google 등)의 홈페이지 URL을 실제 RSS 피드 URL로 변환하는 상세한 휴리스틱이 부족합니다.
*   **새로운 RSS 피드 추가 안됨:** 스크립트가 실행될 때 `Updated feeds.json with 0 new RSS feeds.` 메시지가 계속 나타나, 개선된 로직이 새로운 RSS 피드를 효과적으로 찾아내지 못하고 있음을 보여줍니다.

## 2. 목표

제공된 `src/data/bookmarks.md` 파일을 기반으로 `src/data/feeds.json`에 더 많은 RSS 피드를 정확한 카테고리(예: `ai-trend`, `dev-blog`)와 함께 추가하고, RSS 피드를 찾을 수 없는 URL은 `src/data/non-rss-sources.json`에 정확한 카테고리로 분류하여 저장하는 것입니다.

## 3. 상세 계획 (구현 단계)

### 3.1 `scripts/update-feeds-from-bookmarks.ts` 수정

#### 3.1.1 `parseMarkdownBookmarks` 함수 개선 (카테고리 추출 로직)

*   **현재 문제점:** `categoryMatch[1].trim()` (예: "🤖 AI")에서 이모지 등을 제거하여 `CATEGORY_MAP`의 키(예: "AI")와 정확히 일치시키는 과정에서 오류가 발생하고 있습니다.
*   **개선 방안:** `rawCategoryNameWithEmoji` 문자열에서 선행하는 이모지와 공백을 더 정확하게 제거하여 `CATEGORY_MAP`의 키와 일치하는 깔끔한 카테고리 텍스트를 추출하도록 정규식 로직을 수정합니다.
    *   `const cleanCategoryText = rawCategoryNameWithEmoji.replace(/^\P{Emoji_Presentation}\s*/u, '').trim();` 이 현재 코드인데, 이모지 제거가 제대로 안되는 것 같습니다.
    *   `rawCategoryNameWithEmoji.replace(/^[^\p{L}\p{N}]*/u, '').trim();` 와 같이 선행하는 모든 비문자/비숫자를 제거하도록 변경하여 "AI" 또는 "개발/테크"를 직접 추출하도록 합니다.

#### 3.1.2 `guessRssUrl` 함수 개선 (RSS URL 추론 휴리스틱)

*   **현재 문제점:** `url.includes()` 기반의 광범위한 체크만으로는 정확한 RSS 피드 URL을 찾아내지 못하는 경우가 많습니다. `hostname.includes()`를 기반으로 한 상세하고 플랫폼별 특화된 추론 로직이 필요합니다.
*   **개선 방안:** 각 북마크 URL의 `hostname`과 `pathname`을 면밀히 분석하여, 주요 플랫폼(예: `clova.ai`, `openai.com`, `blog.google`, `d2.naver.com`, `tech.kakao.com`, `toss.tech`, `techblog.woowahan.com`, `medium.com`, `brunch.co.kr`, `pxd.co.kr` 등)의 알려진 RSS 피드 URL 패턴에 따라 정확한 RSS URL을 구성하도록 로직을 강화합니다.
    *   홈페이지 URL(예: `https://d2.naver.com/home`)을 canonical RSS URL(예: `https://d2.naver.com/d2.atom`)로 변환하는 명시적 매핑을 추가합니다.
    *   `blog.google/intl/ko-kr`과 같이 언어별 경로가 있는 경우도 고려합니다.
    *   특정 게시물 URL(예: `lemondesign.tistory.com/65`)이 입력되었을 때, 해당 블로그의 기본 RSS 피드(예: `lemondesign.tistory.com/rss`)를 반환하도록 처리합니다.
    *   RSS 피드가 없는 것으로 확인된 URL(예: `coupang.jobs`의 채용 페이지, `data.go.kr`의 공공데이터 포털)은 명시적으로 `null`을 반환하도록 처리합니다.

## 4. 진행 순서

1.  `scripts/update-feeds-from-bookmarks.ts` 파일을 위 상세 계획에 따라 수정합니다.
2.  `git add` 명령어로 수정된 파일을 스테이징합니다.
3.  `git commit` 명령어로 변경 내용을 커밋합니다. (커밋 메시지에 상세 내용 포함)
4.  `git push` 명령어로 GitHub에 변경 내용을 푸시합니다.
5.  사용자에게 `npm run update-feeds-from-bookmarks` 스크립트를 다시 실행하도록 안내하고, 업데이트된 `feeds.json` 및 `non-rss-sources.json`의 내용을 확인해 달라고 요청합니다.

## 5. 메모리 저장 내용 (요약)

사용자가 제공한 Markdown 북마크 파일에서 RSS 피드와 카테고리를 더 정확하게 파싱하고, `src/data/feeds.json` 및 `src/data/non-rss-sources.json`을 업데이트하는 로직을 개선하는 중. 특히 카테고리 이름 추출 및 플랫폼별 RSS URL 추론 로직을 강화하여 `feeds.json`에 0개의 새 피드가 추가되는 문제를 해결하는 데 집중하고 있음.