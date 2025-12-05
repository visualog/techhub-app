'use client';

import { ArticleList } from "@/components/ArticleList";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";

export default function Home() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const categoryName = categories.find(
    (cat) => cat.id === currentCategory
  )?.name || "전체 보기";

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>
      </div>
      <ArticleList />
    </>
  );
}
