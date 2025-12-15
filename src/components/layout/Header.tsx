import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full h-16 px-4 sm:px-6 lg:px-8 border-b bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold text-neutral-900 dark:text-white">
          TechHub
        </Link>
      </div>
      <div className="flex-1 max-w-md mx-auto px-4">
        <SearchBar />
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu trigger={<Avatar />}>
          <DropdownMenuItem href="/bookmarks">
            북마크
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
