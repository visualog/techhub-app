'use client';

import { motion } from 'framer-motion';

export function FluidBackground({ className }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* 
               SVG Filter for Gooey Effect 
               Note: We render this hidden but reference it via CSS filter
            */}
            <svg className="hidden">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            {/* Container applying the filter */}
            <div className="w-full h-full relative" style={{ filter: 'url(#goo)' }}>
                {/* Moving Blobs */}
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, 50, 100, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        x: [0, -100, 50, 0],
                        y: [0, 100, 50, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70"
                    animate={{
                        x: [0, 50, -50, 0],
                        y: [0, -50, 50, 0],
                        scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
                {/* Small interactive blob following mouse? Maybe too complex for now, stick to ambient */}
            </div>

            {/* Noise texture overlay for texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
        </div>
    );
}
