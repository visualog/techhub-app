'use client';

import { Article } from "@/data/mock-articles";
import Image from "next/image";
import { useBookmarks } from "@/lib/hooks/useBookmarks";

interface ArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
}

// 비디오 재생 아이콘 컴포넌트 - 이미지 위에 중앙 배치되는 재생 버튼
const PlayIcon = () => (
  <svg
    className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-12 text-white opacity-80 group-hover:opacity-100 transition-opacity"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
      clipRule="evenodd"
    />
  </svg>
);

// 날짜 포매팅 헬퍼 함수
function formatRelativeDate(dateString: string): string {
  const now = new Date();
  const pubDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - pubDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;

  if (diffInSeconds < secondsInMinute) {
    return "방금 전";
  } else if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    return `${minutes}분 전`;
  } else if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    return `${hours}시간 전`;
  } else if (diffInSeconds < secondsInWeek) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    return `${days}일 전`;
  } else {
    const year = pubDate.getFullYear();
    const month = String(pubDate.getMonth() + 1).padStart(2, '0');
    const day = String(pubDate.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}

export function ArticleCard({ article, onArticleClick }: ArticleCardProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(article.id);

  const formattedDate = formatRelativeDate(article.pubDate);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    if (bookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  return (
    <>
      {/* 메인 카드 컨테이너 - relative positioning으로 북마크 버튼 배치 */}
      <div 
        className="relative block h-full group cursor-pointer"
        onClick={() => onArticleClick(article)}
      >
        {/* 카드 내부 컨테이너 - 그림자 효과와 호버 애니메이션 */}
        <div className="flex flex-col h-full rounded-xl hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          {/* 아티클 이미지 영역 - 이미지가 있을 경우 */}
          {article.image && (
            <div className="relative w-full overflow-hidden aspect-video rounded-xl">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
                className="transition-transform duration-300 group-hover:scale-125"
              />
              {/* 비디오 아티클인 경우 재생 아이콘 표시 */}
              {article.isVideo && <PlayIcon />}
            </div>
          )}
          {/* 이미지 없을 경우 표시되는 플레이스홀더 */}
          {!article.image && (
            <div className="relative w-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center aspect-video rounded-xl">
              <span className="text-neutral-500 dark:text-neutral-400 text-sm">No Image</span>
            </div>
          )}
          {/* 카드 콘텐츠 영역 - 제목, 요약, 태그, 메타 정보 */}
          <div className="p-4 flex flex-col flex-grow">
            {/* 메타 정보 영역 - 출처와 발행일 */}
            <div className="flex justify-start items-center text-xs font-normal text-neutral-500 dark:text-neutral-400 mb-2">
              <span>{article.source}</span>
              <span className="mx-2 opacity-50">|</span>
              <span>{formattedDate}</span>
            </div>
            {/* 아티클 제목 */}
            <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white leading-tight">
              {article.title}
            </h3>
            {/* 아티클 요약 - 최대 3줄까지 표시 (line-clamp-3) */}
            <p className="text-neutral-400 dark:text-neutral-600 text-sm mb-3 line-clamp-3">
              {article.summary}
            </p>
            {/* 태그 목록 */}
            <div className="flex items-center gap-2 mb-3">
              {article.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 2 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  +{article.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* 북마크 토글 버튼 - 우측 상단 고정 위치 */}
        <button
          onClick={handleBookmarkToggle}
          className={`absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-neutral-700 shadow-md transition-colors duration-200
                      ${bookmarked ? 'text-indigo-500' : 'text-neutral-400 hover:text-indigo-400'}`}
          aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
        >
          {/* 북마크 아이콘 - 채워짐/비어있음으로 상태 표시 */}
          <svg
            className="w-5 h-5"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            ></path>
          </svg>
        </button>
      </div>
    </>
  );
}