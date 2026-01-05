'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Article } from '@/data/mock-articles';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';

interface BookmarksContextType {
  bookmarks: Article[];
  addBookmark: (article: Article) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  isBookmarked: (articleId: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  // Load from LocalStorage initially (for guest or initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
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
  }, [user]);

  // Sync with Firestore when user is logged in
  useEffect(() => {
    if (!user) return;

    const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
    const q = query(bookmarksRef, orderBy('savedAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // If Firestore is empty, check if we need to migrate local bookmarks
      if (snapshot.empty && !isMigrating) {
        const localBookmarks = localStorage.getItem('techhub_bookmarks');
        if (localBookmarks) {
          try {
            setIsMigrating(true);
            const parsedLocal: Article[] = JSON.parse(localBookmarks);
            if (parsedLocal.length > 0) {
              const batch = writeBatch(db);
              parsedLocal.forEach(article => {
                const docRef = doc(bookmarksRef, article.id);
                // Ensure no undefined values to prevent Firestore errors
                const { ...articleData } = article;
                batch.set(docRef, {
                  ...articleData,
                  savedAt: serverTimestamp()
                });
              });
              await batch.commit();
              console.log("Migrated local bookmarks to Firestore");
              // Clear local storage after migration to avoid confusion? 
              // Or keep it as a backup/cache? Let's keep it but maybe clear it to signify sync.
              // For now, let's leave it.
            }
          } catch (e) {
            console.error("Migration failed", e);
          } finally {
            setIsMigrating(false);
          }
        }
      }

      const syncedBookmarks: Article[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));

      setBookmarks(syncedBookmarks);
    });

    return () => unsubscribe();
  }, [user, isMigrating]);

  // Sync state to LocalStorage (as a backup/cache for guest mode switch)
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      localStorage.setItem('techhub_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  const addBookmark = async (article: Article) => {
    if (user) {
      try {
        // Firestore save
        const { ...articleData } = article;
        await setDoc(doc(db, 'users', user.uid, 'bookmarks', article.id), {
          ...articleData,
          savedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to save bookmark to Firestore", e);
      }
    } else {
      // Local save
      setBookmarks((prevBookmarks) => {
        if (!prevBookmarks.some((b) => b.id === article.id)) {
          return [{ ...article, bookmarked: true }, ...prevBookmarks];
        }
        return prevBookmarks;
      });
    }
  };

  const removeBookmark = async (articleId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', articleId));
      } catch (e) {
        console.error("Failed to remove bookmark from Firestore", e);
      }
    } else {
      setBookmarks((prevBookmarks) =>
        prevBookmarks.filter((article) => article.id !== articleId)
      );
    }
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
