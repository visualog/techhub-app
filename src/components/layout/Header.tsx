"use client";

import { SearchBar } from '@/components/ui/SearchBar';
import { UserMenu } from '@/components/ui/user-menu';
import { Logo } from '@/components/ui/logo';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function Header() {
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();
  const { scrollY, scrollYProgress } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isOverThreshold = latest > 10;
    if (isOverThreshold !== isScrolled) {
      setIsScrolled(isOverThreshold);
    }
  });

  // Update progress bar directly without animation
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${latest})`;
    }
  });

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 sm:px-6 lg:px-8 border-b bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm transition-colors duration-300 ${isScrolled ? 'border-neutral-200 dark:border-neutral-800' : 'border-transparent'
      }`}>
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

      {/* Scroll Progress Bar */}
      <div
        ref={progressRef}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 origin-left"
        style={{ transform: 'scaleX(0)' }}
      />
    </header>
  );
}
