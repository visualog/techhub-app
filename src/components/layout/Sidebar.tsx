'use client';

import { categories } from "@/data/categories";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

export function Sidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  return (
    <aside className="w-full md:w-64 p-4 border-b md:border-b-0 border-neutral-200 dark:border-neutral-800 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
      <h2 className="hidden">Categories</h2>
      <nav>
        <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {categories.map((category) => (
            <li key={category.id} className="flex-shrink-0">
              <Link
                href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                className={`block py-2 px-4 rounded whitespace-nowrap ${
                  currentCategory === category.id
                    ? 'font-bold bg-neutral-100 dark:bg-neutral-700'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
