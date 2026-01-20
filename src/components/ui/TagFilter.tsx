'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

import { POPULAR_TAGS_BY_CATEGORY } from '@/data/popular-tags';

interface TagFilterProps {
    className?: string;
}

export function TagFilter({ className }: TagFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get('tag');
    const currentCategory = searchParams.get('category') || 'all';

    // Select tags for the current category, or fallback to 'all' list
    const tagsToDisplay = POPULAR_TAGS_BY_CATEGORY[currentCategory] || POPULAR_TAGS_BY_CATEGORY['all'];

    const handleTagClick = (tag: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedTag === tag) {
            params.delete('tag'); // Toggle off
        } else {
            params.set('tag', tag); // Toggle on
        }

        router.push(`/?${params.toString()}`);
    };

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftMask, setShowLeftMask] = React.useState(false);
    const [showRightMask, setShowRightMask] = React.useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftMask(scrollLeft > 0);
            setShowRightMask(scrollLeft < scrollWidth - clientWidth - 1); // -1 buffer for precision issues
        }
    };

    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [tagsToDisplay]);

    return (
        <div className={cn("w-full min-w-0 flex items-center gap-2 mb-2", className)}>
            <Button
                variant={selectedTag ? "outline" : "default"}
                size="sm"
                className={cn(
                    "rounded-full whitespace-nowrap transition-all h-6 text-xs font-normal flex-shrink-0",
                    !selectedTag ? "bg-black text-white dark:bg-white dark:text-black" : "text-muted-foreground border-transparent bg-muted/50 hover:bg-muted"
                )}
                onClick={() => router.push('/')}
            >
                All
            </Button>

            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex-1 overflow-x-auto flex items-center gap-2 py-2 px-1 scrollbar-hide"
                style={{
                    maskImage: `linear-gradient(to right, ${showLeftMask ? 'transparent, black 20px' : 'black 0%'}, ${showRightMask ? 'black calc(100% - 20px), transparent 100%' : 'black 100%'})`,
                    WebkitMaskImage: `linear-gradient(to right, ${showLeftMask ? 'transparent, black 20px' : 'black 0%'}, ${showRightMask ? 'black calc(100% - 20px), transparent 100%' : 'black 100%'})`
                }}
            >
                {tagsToDisplay.map((tag) => (
                    <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTagClick(tag)}
                        className={cn(
                            "rounded-full whitespace-nowrap transition-all border-0 shadow-none h-6 text-xs font-normal flex-shrink-0",
                            selectedTag === tag
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "text-gray-700 dark:text-gray-300 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        )}
                    >
                        {tag}
                    </Button>
                ))}
            </div>
        </div>
    );
}
