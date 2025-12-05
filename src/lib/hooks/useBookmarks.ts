'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/data/mock-articles'; // Assuming Article type is available

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  // Load bookmarks from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBookmarks = localStorage.getItem('techhub_bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('techhub_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = (article: Article) => {
    setBookmarks((prevBookmarks) => {
      if (!prevBookmarks.some((b) => b.id === article.id)) {
        return [...prevBookmarks, { ...article, bookmarked: true }];
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

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
