'use client'; // Added use client

import { Article } from "@/data/mock-articles";
import Image from "next/image";
import Link from "next/link";
import { useBookmarks } from "@/lib/hooks/useBookmarks"; // Import useBookmarks hook

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks(); // Use the hook
  const bookmarked = isBookmarked(article.id); // Check if current article is bookmarked

  const formattedDate = new Date(article.pubDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the article link
    if (bookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  return (
    <div className="relative block h-full group"> {/* Added relative and group */}
      <Link href={article.link} target="_blank" rel="noopener noreferrer" className="block h-full">
        <div className="flex flex-col h-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 overflow-hidden">
          {article.image && (
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
                className="transition-transform duration-300 group-hover:scale-105" // Added group-hover
              />
            </div>
          )}
          {!article.image && (
            <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
            </div>
          )}
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white leading-tight">
              {article.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 flex-grow line-clamp-3">
              {article.summary}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
              <span>{article.source}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </Link>
      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkToggle}
        className={`absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md transition-colors duration-200
                    ${bookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
      >
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
  );
}
