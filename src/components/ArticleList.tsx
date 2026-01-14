'use client';

import { ArticleCard } from "@/components/ui/ArticleCard";
import { Article } from "@/data/mock-articles";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ArticleListSkeleton } from "@/components/ui/ArticleListSkeleton";


// Define ViewMode type here or import it if shared (simple enough to duplicate or infer)
type ViewMode = 'grid' | 'masonry';

interface ArticleListProps {
  onArticleClick: (article: Article) => void;
  viewMode?: ViewMode;
  onTagClick?: (tag: string) => void;
}

export function ArticleList({ onArticleClick, onTagClick, viewMode = 'grid' }: ArticleListProps) {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = searchParams.get('category') || 'all';
  const currentTag = searchParams.get('tag');
  const searchTerm = searchParams.get('search') || '';

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("ArticleList: Fetching articles...");
    try {
      const query = new URLSearchParams();
      if (currentCategory !== 'all') {
        query.set('category', currentCategory);
      }
      if (currentTag) {
        query.set('tag', currentTag);
      }
      if (searchTerm) {
        query.set('search', searchTerm);
      }

      console.log("ArticleList: Query:", query.toString());
      const res = await fetch(`/api/articles?${query.toString()}`);
      if (!res.ok) {
        console.error("ArticleList: Fetch failed", res.status);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Article[] = await res.json();
      console.log("ArticleList: Data received", data.length, data[0]);
      setArticles(data);
    } catch (error: unknown) {
      console.error("ArticleList: Error", error);
      setError((error as Error).message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentTag, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  if (loading) {
    return <ArticleListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        <div className="text-red-500 mb-4 font-medium">오류가 발생했습니다</div>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <button
          onClick={() => fetchArticles()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          다시 시도
        </button>
      </div>
    );
  }

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