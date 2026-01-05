'use client';

import { useState } from 'react';
import { ArticleList } from "@/components/ArticleList";
import { TagFilter } from '@/components/TagFilter';
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";
import { Article } from '@/data/mock-articles';
import { ArticleDetailModal } from '@/components/ui/ArticleDetailModal';

export default function Home() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const categoryName = categories.find(
    (cat) => cat.id === currentCategory
  )?.name || "전체 보기";

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {categoryName === "전체 보기" ? "Latest Articles" : categoryName}
            </h1>

          </div>

          <TagFilter />

          <ArticleList onArticleClick={handleArticleClick} />
        </div>
      </div>
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
