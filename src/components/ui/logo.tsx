import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <Link
            href="/"
            className={cn("text-xl font-bold text-neutral-900 dark:text-white", className)}
        >
            TechHub
        </Link>
    );
}
