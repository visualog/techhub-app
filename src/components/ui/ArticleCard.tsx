'use client';

import { Article } from "@/data/mock-articles";
import { useBookmarksContext } from "@/context/BookmarksContext";
import { ArticleImage } from "./article-image";
import { ArticleMeta } from "./article-meta";
import { TagChip } from "./tag-chip";
import { BookmarkButton } from "./bookmark-button";

import { useUI } from "@/context/UIContext";
import { Loader2 } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  onArticleClick: (article: Article) => void;
  priority?: boolean;
  onTagClick?: (tag: string) => void;
}

export function ArticleCard({ article, onArticleClick, priority = false, onTagClick }: ArticleCardProps) {
  console.log("ArticleCard: Rendering", article.id);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarksContext();
  const { isProcessing } = useUI();
  const bookmarked = isBookmarked(article.id);

  const isGeneratingThumbnail = isProcessing(article.id, 'thumbnail');
  const isTranslating = isProcessing(article.id, 'translate');
  const isBusy = isGeneratingThumbnail || isTranslating;

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  return (
    <>
      <article
        className="relative block h-full group cursor-pointer"
        onClick={() => onArticleClick(article)}
      >
        <div className="relative flex flex-col h-full rounded-3xl transition-shadow duration-300 transition-transform duration-300 group-hover:-translate-y-2">

          {/* Busy Overlay */}
          {isBusy && (
            <div className="absolute inset-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium animate-in fade-in duration-300">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span>{isGeneratingThumbnail ? '썸네일 생성 중...' : '번역 중...'}</span>
            </div>
          )}

          <ArticleImage
            src={article.image}
            alt={article.title}
            isVideo={article.isVideo}
            priority={priority}
          />

          <div className="p-4 flex flex-col flex-grow">

            <ArticleMeta source={article.source} date={article.pubDate} />

            <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white leading-[24px] tracking-tight">
              {article.title}
            </h3>

            <div className="flex flex-wrap gap-2 mt-4 relative z-20">
              <TagChip
                label={article.category}
                variant="primary"
              />
              {article.tags.slice(0, 3).map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  variant="default"
                  onClick={onTagClick}
                />
              ))}
              {article.tags.length > 3 && (
                <TagChip
                  label={`+${article.tags.length - 3}`}
                  variant="default"
                  className="bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-gray-500"
                />
              )}
            </div>
          </div>

          <BookmarkButton
            isBookmarked={bookmarked}
            onClick={handleBookmarkToggle}
            className="absolute top-4 right-4 z-10"
          />
        </div>
      </article>
    </>
  );
}