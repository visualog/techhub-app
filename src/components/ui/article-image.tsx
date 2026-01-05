import React from 'react';
import Image from 'next/image';
import { PlayIcon } from './play-icon';

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
 * Handles the hover shadow effect on the container.
 */
export const ArticleImage = ({ src, alt, isVideo = false, priority = false }: ArticleImageProps) => {
    if (src) {
        return (
            <div className="relative w-full overflow-hidden rounded-3xl transition-shadow duration-300 group-hover:shadow-xl">
                <Image
                    src={src}
                    alt={alt}
                    width={500}
                    height={300}
                    className="w-full h-auto transition-transform duration-300"
                    style={{ objectFit: "contain" }}
                    priority={priority}
                />
                {isVideo && <PlayIcon />}
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center aspect-video rounded-3xl group-hover:shadow-xl transition-shadow duration-300">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm">No Image</span>
        </div>
    );
};
