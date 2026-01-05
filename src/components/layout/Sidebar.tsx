'use client';

import { categories } from "@/data/categories";
import { NavItem } from "@/components/ui/nav-item";
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
              <NavItem
                href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                label={category.name.replace('블로그', '').replace('인사이트', '').replace('리포트', '').trim()}
                count={counts[category.id] || 0}
                isActive={currentCategory === category.id}
              />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
