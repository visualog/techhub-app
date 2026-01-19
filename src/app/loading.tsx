
import { ArticleListSkeleton } from "@/components/ui/ArticleListSkeleton";

export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-6">
                {/* Title & Toggle Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="h-9 w-48 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-9 w-24 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>

                {/* Filter Skeleton */}
                <div className="w-full h-10 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />

                {/* Article List Skeleton */}
                <ArticleListSkeleton />
            </div>
        </div>
    );
}
