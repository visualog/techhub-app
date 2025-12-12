'use client';

import { useState } from 'react';
import { ArticleList } from "@/components/ArticleList";
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
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>
      </div>
      <ArticleList onArticleClick={handleArticleClick} />

      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}
