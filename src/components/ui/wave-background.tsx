'use client';

import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

export function WaveBackground({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const noise3D = createNoise3D();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let frame = 0;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        // Config
        // Config - Optimized for subtlety
        const GAP = 50;
        const BASE_SIZE = 0.8;
        const NOISE_SCALE = 0.001; // Smoother, larger flow
        const SPEED = 0.001; // Almost static, breathing
        const MOUSE_RADIUS = 300;
        const MOUSE_FORCE = 0.2;

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            const cols = Math.ceil(width / GAP) + 2; // Extra cols for padding
            const rows = Math.ceil(height / GAP) + 2;

            const isDark = document.documentElement.classList.contains('dark');
            const baseR = isDark ? 255 : 0;
            const baseG = isDark ? 255 : 0;
            const baseB = isDark ? 255 : 0;

            for (let ix = 0; ix < cols; ix++) {
                for (let iy = 0; iy < rows; iy++) {
                    const originalX = (ix - 1) * GAP;
                    const originalY = (iy - 1) * GAP;

                    // 1. Organic Noise Displacement (The "Swimming" effect)
                    // We use 3D noise (x, y, time) to get smooth transition
                    const noiseValX = noise3D(originalX * NOISE_SCALE, originalY * NOISE_SCALE, frame * SPEED);
                    const noiseValY = noise3D(originalX * NOISE_SCALE + 1000, originalY * NOISE_SCALE + 1000, frame * SPEED);

                    let x = originalX + noiseValX * 20; // Move up to 20px
                    let y = originalY + noiseValY * 20;

                    // 2. Mouse Interaction (Repulsion)
                    const dx = x - mouseRef.current.x;
                    const dy = y - mouseRef.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MOUSE_RADIUS) {
                        const angle = Math.atan2(dy, dx);
                        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS; // 1 at center, 0 at edge
                        const easeForce = Math.pow(force, 2) * MOUSE_FORCE * 100; // Non-linear push

                        x += Math.cos(angle) * easeForce;
                        y += Math.sin(angle) * easeForce;
                    }

                    // Draw
                    // Clear Visibility Adjustment (10-20%)
                    const alpha = 0.1 + (noiseValX * 0.5 + 0.5) * 0.1; // Base 0.1, Max 0.2

                    ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x, y, BASE_SIZE, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            frame++;
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`} />;
}
