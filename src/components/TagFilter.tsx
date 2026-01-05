'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

const POPULAR_TAGS = [
    "AI",
    "LLM",
    "Cloud",
    "Conference",
    "Toss",
    "Backend",
    "Frontend",
    "Dev",
    "React",
    "Next.js"
];

interface TagFilterProps {
    className?: string;
}

export function TagFilter({ className }: TagFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedTag = searchParams.get('tag');

    const handleTagClick = (tag: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedTag === tag) {
            params.delete('tag'); // Toggle off
        } else {
            params.set('tag', tag); // Toggle on
        }

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className={cn("w-full overflow-hidden", className)}>
            <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 px-1 scrollbar-hide mask-fade-sides">
                <Button
                    variant={selectedTag ? "outline" : "default"}
                    size="sm"
                    className={cn(
                        "rounded-full whitespace-nowrap transition-all",
                        !selectedTag ? "bg-black text-white dark:bg-white dark:text-black" : "text-muted-foreground border-transparent bg-muted/50 hover:bg-muted"
                    )}
                    onClick={() => router.push('/')}
                >
                    All
                </Button>

                {POPULAR_TAGS.map((tag) => (
                    <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTagClick(tag)}
                        className={cn(
                            "rounded-full whitespace-nowrap transition-all border-0 shadow-none",
                            selectedTag === tag
                                ? "bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
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
