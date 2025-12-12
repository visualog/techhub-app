'use client';

import { useBookmarksContext } from '@/context/BookmarksContext';

// This hook is now a simple wrapper around the context hook.
// This keeps the component-level API the same.
export function useBookmarks() {
  return useBookmarksContext();
}