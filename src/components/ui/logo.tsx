import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <Link
            href="/"
            className={cn("flex items-center gap-1 font-bold text-neutral-900 dark:text-white", className)}
            style={{ fontSize: '8px' }}
        >
            <img
                src="/TechBird.svg"
                alt="TechBird"
                style={{ height: '32px' }}
                className="dark:invert"
            />
        </Link>
    );
}
