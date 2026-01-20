'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-black">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse delay-1000" />

            {/* Glassmorphism Card */}
            <div className="relative z-10 flex flex-col items-center max-w-md w-full p-8 mx-4 text-center rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl shadow-2xl">
                <div className="w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg transform -rotate-6">
                    <span className="text-4xl font-bold text-white">404</span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    Page Not Found
                </h2>

                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    The page you are looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                        variant="default"
                        size="lg"
                        className="w-full rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                        asChild
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full rounded-full border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
