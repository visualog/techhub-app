'use client';

import { ArticleCard } from "@/components/ui/ArticleCard";
import { useBookmarks } from "@/lib/hooks/useBookmarks";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">북마크</h1>
      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          아직 북마크한 게시글이 없습니다.
        </p>
      )}
    </div>
  );
}
