"use client";

import { SearchBar } from '@/components/ui/SearchBar';
import { UserMenu } from '@/components/ui/user-menu';
import { Logo } from '@/components/ui/logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 sm:px-6 lg:px-8 border-b bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center">
        <Logo />
      </div>
      <div className="flex-1 max-w-md mx-auto px-4">
        <SearchBar />
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <a href="/admin" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Admin
          </a>
        )}
        <ModeToggle />
        <UserMenu user={user} onLogin={loginWithGoogle} onLogout={logout} />
      </div>
    </header>
  );
}
