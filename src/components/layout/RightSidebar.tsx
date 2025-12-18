// src/components/layout/RightSidebar.tsx
'use client';

import React from 'react';
import { useFilter } from '../../context/FilterContext';

export function RightSidebar() {
  const { allSources, toggleSource, resetSources, isSourceSelected } = useFilter();

  return (
    // Adjusted: Removed background, shadow, rounded-lg. Adjusted sticky top and height.
    <div className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] p-8 overflow-y-auto">
      
      {/* 출처 필터링 */}
      <div className="mb-0">
        <div className="flex flex-wrap gap-2">
          {allSources.map((source) => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                          ${isSourceSelected(source)
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                          }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* 여기에 다른 필터 섹션을 추가할 수 있습니다 */}
      {/* <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">카테고리</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-700 text-sm">개발</button>
        </div>
      </div> */}
    </div>
  );
}