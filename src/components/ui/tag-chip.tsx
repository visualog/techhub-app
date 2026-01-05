import React from 'react';

interface TagChipProps {
    label: string;
    onClick?: (tag: string) => void;
    variant?: 'primary' | 'default';
    className?: string;
}

/**
 * TagChip Atom
 * Displays a tag or category. 
 * 'primary' variant usually for Categories (Indigo background).
 * 'default' variant for Tags (Gray background, clickable).
 */
export const TagChip = ({ label, onClick, variant = 'default', className }: TagChipProps) => {
    // Reduced font weight from 'font-medium' to default (roughly 400), or specify 'font-normal' explicitly if needed.
    // However, user asked for "one step thinner", and current is 'font-medium' (500). 'font-normal' (400) is appropriate.
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal transition-colors";

    const variants = {
        primary: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        // Matched colors from TagFilter: bg-neutral-200 text-gray-700 (light), bg-neutral-800 text-gray-300 (dark)
        default: `bg-neutral-200 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 ${onClick
            ? 'cursor-pointer hover:bg-neutral-300 hover:text-gray-900 dark:hover:bg-neutral-700 dark:hover:text-gray-100'
            : ''
            }`
    };

    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick(label);
        }
    };

    return (
        <span
            onClick={handleClick}
            className={`${baseStyles} ${variants[variant]} ${className || ''}`}
        >
            {variant === 'default' ? `#${label}` : label}
        </span>
    );
};
