'use client';

import React, { useId } from 'react';

interface SquircleProps {
    /** 
     * Corner curvature (0-1). 
     * If provided, overrides 'radius'.
     */
    curvature?: number;
    /** 
     * Preset corner sizes. 
     * 'sm' ~ 12px feel
     * 'md' ~ 20px feel (default)
     * 'lg' ~ 32px feel
     */
    radius?: 'xs' | 'sm' | 'md' | 'lg';
    /** The content to be clipped */
    children: React.ReactNode;
    /** Additional CSS classes */
    className?: string;
}

const RADIUS_MAP = {
    xs: 0.01,
    sm: 0.02,
    md: 0.04,
    lg: 0.1
};

/**
 * iOS-style Squircle (Superellipse) container
 * Uses SVG clip-path for smooth continuous corners.
 * Zero runtime JS overhead for resizing.
 */
export function Squircle({ curvature, radius = 'md', children, className }: SquircleProps) {
    const clipId = useId();
    const finalCurvature = curvature ?? RADIUS_MAP[radius];

    // Generate squircle path
    // This approximates Apple's continuous corner radius
    const generateSquirclePath = (r: number) => {
        // r controls the "squircle-ness" (0 = rectangle, 1 = more circular)
        const c = r * 0.5522847498; // Bezier control point factor
        const inset = r * 0.1;

        return `
      M ${inset} 0.5
      C ${inset} ${c + inset}, ${c + inset} ${inset}, 0.5 ${inset}
      C ${1 - c - inset} ${inset}, ${1 - inset} ${c + inset}, ${1 - inset} 0.5
      C ${1 - inset} ${1 - c - inset}, ${1 - c - inset} ${1 - inset}, 0.5 ${1 - inset}
      C ${c + inset} ${1 - inset}, ${inset} ${1 - c - inset}, ${inset} 0.5
      Z
    `.trim();
    };

    return (
        <div className={className} style={{ position: 'relative' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                        <path d={generateSquirclePath(finalCurvature)} />
                    </clipPath>
                </defs>
            </svg>
            <div style={{ clipPath: `url(#${clipId})`, width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
}
