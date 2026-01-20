"use client";

import { SearchBar } from '@/components/ui/SearchBar';
import { UserMenu } from '@/components/ui/user-menu';
import { Logo } from '@/components/ui/logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function Header() {
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isOverThreshold = latest > 10;
    if (isOverThreshold !== isScrolled) {
      setIsScrolled(isOverThreshold);
    }
  });

  return (
    <header className={`sticky top-0 z-50 w-full h-16 border-b bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-colors duration-300 ${isScrolled ? 'border-zinc-200 dark:border-zinc-800' : 'border-transparent'
      }`}>
      <div className="max-w-screen-xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex-1 max-w-md mx-auto px-4">
          <SearchBar />
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserMenu user={user} onLogin={loginWithGoogle} onLogout={logout} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
