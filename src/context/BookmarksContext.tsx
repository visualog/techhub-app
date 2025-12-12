'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Article } from '@/data/mock-articles';

interface BookmarksContextType {
  bookmarks: Article[];
  addBookmark: (article: Article) => void;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedBookmarks = localStorage.getItem('techhub_bookmarks');
        if (storedBookmarks) {
          setBookmarks(JSON.parse(storedBookmarks));
        }
      } catch (error) {
        console.error("Failed to parse bookmarks from localStorage", error);
        setBookmarks([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('techhub_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = (article: Article) => {
    setBookmarks((prevBookmarks) => {
      if (!prevBookmarks.some((b) => b.id === article.id)) {
        return [{ ...article, bookmarked: true }, ...prevBookmarks];
      }
      return prevBookmarks;
    });
  };

  const removeBookmark = (articleId: string) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter((article) => article.id !== articleId)
    );
  };

  const isBookmarked = (articleId: string) => {
    return bookmarks.some((article) => article.id === articleId);
  };

  return (
    <BookmarksContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarksContext() {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarksContext must be used within a BookmarksProvider');
  }
  return context;
}
