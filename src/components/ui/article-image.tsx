import React from 'react';
import Image from 'next/image';
import { PlayIcon } from './play-icon';
import { Squircle } from './squircle';

interface ArticleImageProps {
    src?: string;
    alt: string;
    isVideo?: boolean;
    priority?: boolean;
}

/**
 * ArticleImage Molecule
 * Displays the main article image or a placeholder if missing.
 * Includes the PlayIcon for video content.
 * Uses iOS-style squircle corners for a premium feel.
 */
export const ArticleImage = ({ src, alt, isVideo = false, priority = false }: ArticleImageProps) => {
    if (src) {
        return (
            <Squircle radius="xs" className="relative w-full transition-all duration-300 group-hover:drop-shadow-xl aspect-[297/210]">
                <div className="relative w-full h-full overflow-hidden">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300"
                        priority={priority}
                    />
                    {isVideo && <PlayIcon />}
                </div>
            </Squircle>
        );
    }

    return (
        <Squircle radius="xs" className="relative w-full transition-all duration-300 group-hover:drop-shadow-xl aspect-[297/210]">
            <div className="relative w-full h-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <span className="text-zinc-500 dark:text-zinc-400 text-sm">No Image</span>
            </div>
        </Squircle>
    );
};
