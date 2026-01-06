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
        primary: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        default: `bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 ${onClick
            ? 'cursor-pointer hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300'
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
