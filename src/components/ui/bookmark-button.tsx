import React from 'react';

interface BookmarkButtonProps {
    isBookmarked: boolean;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}

/**
 * BookmarkButton Atom
 * Toggles between bookmarked (filled) and unbookmarked (outlined) states.
 * Handles its own visual state based on props, but logic is passed in.
 */
export const BookmarkButton = ({ isBookmarked, onClick, className }: BookmarkButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-full bg-white/50 dark:bg-neutral-700/50 backdrop-blur-md transition-all duration-200 cursor-pointer ${isBookmarked
                    ? 'text-blue-500 opacity-100'
                    : 'text-neutral-400 hover:text-blue-400 opacity-0 group-hover:opacity-100'
                } ${className || ''}`}
            aria-label={isBookmarked ? "북마크 해제" : "북마크 추가"}
        >
            <svg
                className="w-5 h-5"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                ></path>
            </svg>
        </button>
    );
};
