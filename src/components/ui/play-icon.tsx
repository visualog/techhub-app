import React from 'react';

/**
 * PlayIcon Atom
 * Displays a play icon overlay for video content.
 * Intended to be centered over an image or container.
 */
export const PlayIcon = ({ className }: { className?: string }) => (
    <svg
        className={`absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-12 text-white opacity-80 group-hover:opacity-100 transition-opacity ${className || ''}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
            clipRule="evenodd"
        />
    </svg>
);
