'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Sync internal state with URL params if URL changes
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (searchTerm) {
      current.set('search', searchTerm);
    } else {
      current.delete('search');
    }
    const query = current.toString();
    router.push(`/?${query}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <input
        type="text"
        placeholder="검색어를 입력하세요 (제목, 요약, 출처)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 pl-10 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400"
        width="20" 
        height="20" 
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        ></path>
      </svg>
    </form>
  );
}
