'use client';

import { ArticleCard } from "@/components/ui/ArticleCard";
import { Article } from "@/data/mock-articles";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ArticleListSkeleton } from "@/components/ui/ArticleListSkeleton";


// Define ViewMode type here or import it if shared (simple enough to duplicate or infer)
type ViewMode = 'grid' | 'masonry';

interface ArticleListProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  viewMode?: ViewMode;
  onTagClick?: (tag: string) => void;
}

export function ArticleList({ articles, onArticleClick, onTagClick, viewMode = 'grid' }: ArticleListProps) {
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag');
  const searchTerm = searchParams.get('search') || '';

  /* Create unique list */
  const uniqueArticles = articles.length > 0
    ? Array.from(new Map(articles.map(item => [item.link, item])).values())
    : [];

  return (
    <section className="">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueArticles.length > 0 ? (
            uniqueArticles.map((article, index) => (
              <ArticleCard
                key={article.link}
                article={article}
                onArticleClick={onArticleClick}
                priority={index < 2}
                onTagClick={onTagClick}
              />
            ))
          ) : (
            <EmptyState searchTerm={searchTerm} currentTag={currentTag} />
          )}
        </div>
      ) : (
        /* Masonry Layout using CSS Columns */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {uniqueArticles.length > 0 ? (
            uniqueArticles.map((article, index) => (
              <div key={article.link} className="break-inside-avoid mb-6">
                <ArticleCard
                  article={article}
                  onArticleClick={onArticleClick}
                  priority={index < 2}
                  onTagClick={onTagClick}
                />
              </div>
            ))
          ) : (
            <EmptyState searchTerm={searchTerm} currentTag={currentTag} />
          )}
        </div>
      )}
    </section>
  );
}

function EmptyState({ searchTerm, currentTag }: { searchTerm: string, currentTag: string | null }) {
  return (
    <div className="col-span-full py-12 text-center">
      <p className="text-gray-500 dark:text-gray-400 text-lg">
        {searchTerm
          ? `"${searchTerm}"(으)로 검색된 게시글이 없습니다.`
          : currentTag
            ? `"${currentTag}" 태그가 포함된 게시글이 없습니다.`
            : '해당 카테고리에 게시글이 없습니다.'}
      </p>
    </div>
  );
}