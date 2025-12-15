'use client';

import { categories } from "@/data/categories";
import Link from "next/link";
import { useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/articles/counts')
      .then(res => res.json())
      .then(data => setCounts(data));
  }, []);
  
  // Only determine category if we are on the homepage
  const currentCategory = pathname === '/' ? (searchParams.get('category') || 'all') : null;

  return (
    <aside className="w-full md:w-64 p-8 border-b md:border-b-0 border-neutral-200 dark:border-neutral-800 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
      <h2 className="hidden">Categories</h2>
      <nav>
        <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {categories.map((category) => (
            <li key={category.id} className="flex-shrink-0">
              <Link
                href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                className={`flex items-center gap-x-2 py-2 px-4 rounded-xl whitespace-nowrap ${
                  currentCategory === category.id
                    ? 'font-medium bg-neutral-200 dark:bg-neutral-700'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{category.name.replace('블로그', '').replace('인사이트', '').replace('리포트', '').trim()}</span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs opacity-75">
                  {counts[category.id] || 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
