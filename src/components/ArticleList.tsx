'use client';

import { ArticleCard } from "@/components/ui/ArticleCard";
import { Article } from "@/data/mock-articles";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface ArticleListProps {
  onArticleClick: (article: Article) => void;
}

export function ArticleList({ onArticleClick }: ArticleListProps) {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = searchParams.get('category') || 'all';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (currentCategory !== 'all') {
          query.set('category', currentCategory);
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
      } catch (e: any) {
        setError(e.message);
        setArticles([]); // Clear articles on error
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [currentCategory, searchTerm]); // Re-fetch when category or search term changes

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 col-span-full text-center text-gray-500 dark:text-gray-400">
        게시글을 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 col-span-full text-center text-red-500 dark:text-red-400">
        오류 발생: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onArticleClick={onArticleClick}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            {searchTerm
              ? `"${searchTerm}"(으)로 검색된 게시글이 없습니다.`
              : '해당 카테고리에 게시글이 없습니다.'}
          </p>
        )}
      </div>
    </div>
  );
}
