// src/components/layout/RightSidebar.tsx
import React from 'react';

export function RightSidebar() {
  return (
    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-inner sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">필터</h2>
      <div className="space-y-2">
        {/* Source filtering tags will go here */}
        <p className="text-neutral-500 dark:text-neutral-400">출처 필터링 태그</p>
        <p className="text-neutral-500 dark:text-neutral-400">...</p>
      </div>
    </div>
  );
}