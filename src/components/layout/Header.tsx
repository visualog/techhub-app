import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar'; // Import SearchBar

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full h-16 px-4 sm:px-6 lg:px-8 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-800">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
          TechHub
        </Link>
      </div>
      <div className="flex-1 max-w-md mx-auto px-4">
        {/* SearchBar will go here */}
        <SearchBar /> {/* Use SearchBar component */}
      </div>
      <div className="flex items-center gap-4">
        {/* Dark mode toggle, My Bookmarks link will go here */}
        <Link href="/bookmarks" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          내 저장
        </Link>
      </div>
    </header>
  );
}
