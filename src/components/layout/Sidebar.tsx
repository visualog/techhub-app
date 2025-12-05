'use client';

import { categories } from "@/data/categories";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

export function Sidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  return (
    <aside className="w-full md:w-64 md:min-h-screen p-4 border-b md:border-r md:border-b-0 border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4 hidden md:block">Categories</h2>
      <nav>
        <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {categories.map((category) => (
            <li key={category.id} className="flex-shrink-0">
              <Link
                href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                className={`block py-2 px-4 rounded whitespace-nowrap ${
                  currentCategory === category.id
                    ? 'font-bold bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
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
