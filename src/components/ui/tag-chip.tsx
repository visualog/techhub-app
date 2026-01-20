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
    const baseStyles = "inline-flex items-center px-2.5 rounded-full text-xs font-normal transition-colors h-6";

    const variants = {
        primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        default: `bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 ${onClick
            ? 'cursor-pointer hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300'
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
            {label}
        </span>
    );
};
