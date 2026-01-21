'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

            {/* Glassmorphism Card */}
            <div className="relative z-10 flex flex-col items-center max-w-md w-full p-8 mx-4 text-center rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl shadow-2xl">
                <div className="mb-6 flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">
                    Something went wrong!
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-[300px]">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                <Button
                    variant="default"
                    size="lg"
                    className="rounded-full px-8 bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform duration-200"
                    onClick={() => reset()}
                >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 rounded-xl bg-white/50 dark:bg-black/50 border border-white/20 dark:border-black/20 w-full text-left overflow-auto max-h-40 backdrop-blur-sm">
                        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 break-words">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
