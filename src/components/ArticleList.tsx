'use client';

import { ArticleCard } from "@/components/ui/ArticleCard";
import { Article } from "@/data/mock-articles";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ArticleListSkeleton } from "@/components/ui/ArticleListSkeleton";


interface ArticleListProps {
  onArticleClick: (article: Article) => void;
}

export function ArticleList({ onArticleClick }: ArticleListProps) {
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

      const res = await fetch(`/api/articles?${query.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Article[] = await res.json();
      setArticles(data);
    } catch (error: unknown) {
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

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          // Deduplicate articles by LINK to prevent visual duplicates if DB has multiple entries
          Array.from(new Map(articles.map(item => [item.link, item])).values())
            .map((article, index) => (
              <ArticleCard
                key={article.link}
                article={article}
                onArticleClick={onArticleClick}
                priority={index < 2} // Prioritize creating the LCP image for the first couple of items
              />
            ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm
                ? `"${searchTerm}"(으)로 검색된 게시글이 없습니다.`
                : currentTag
                  ? `"${currentTag}" 태그가 포함된 게시글이 없습니다.`
                  : '해당 카테고리에 게시글이 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}