import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavItemProps {
    href: string;
    label: string;
    count?: number;
    isActive?: boolean;
    className?: string;
}

export function NavItem({ href, label, count, isActive, className }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-x-2 py-2 px-4 rounded-xl whitespace-nowrap transition-colors",
                isActive
                    ? "font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                className
            )}
        >
            <span>{label}</span>
            {count !== undefined && count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs opacity-75">
                    {count}
                </span>
            )}
        </Link>
    );
}
