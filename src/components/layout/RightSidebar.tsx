// src/components/layout/RightSidebar.tsx
'use client';

import React from 'react';
import { useFilter } from '../../context/FilterContext';

export function RightSidebar() {
  const { allSources, toggleSource, resetSources, isSourceSelected } = useFilter();

  return (
    // Adjusted: Removed background, shadow, rounded-lg. Adjusted sticky top and height.
    <div className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4"> {/* Added flex container for title and reset icon */}
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">필터</h2>
        <button
          onClick={resetSources}
          className="p-1 rounded-full text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
          aria-label="필터 초기화"
        >
          {/* Refresh Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356-2A8.001 8.001 0 004 12c0 2.973 1.192 5.727 3.11 7.747m0 0l-3.235 3.327m3.235-3.327l3.235-3.327M20 20v-5h-.581m0 0A8.001 8.001 0 0020 12c0-2.973-1.192-5.727-3.11-7.747m0 0l3.235-3.327m-3.235 3.327l-3.235 3.327" />
          </svg>
        </button>
      </div>
      
      {/* 출처 필터링 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">출처</h3>
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
        {/* Removed: "모두 선택 (초기화)" text button */}
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