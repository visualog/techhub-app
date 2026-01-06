'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { TagCount } from '@/types/trends';

interface GravityTagsProps {
    tags: TagCount[];
    className?: string;
}

export function GravityTags({ tags, className }: GravityTagsProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const renderRef = useRef<Matter.Render | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);

    // We map bodies to tag data to render DOM elements on top
    const [bodies, setBodies] = useState<{ id: number; x: number; y: number; angle: number; tag: string; count: number; width: number; height: number; color: string }[]>([]);

    useEffect(() => {
        if (!sceneRef.current) return;

        // 1. Setup Matter.js
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Events = Matter.Events;

        const engine = Engine.create();
        engine.gravity.y = 0; // Zero gravity initially, maybe slight pull? Let's try 0 for floating
        engineRef.current = engine;

        const width = sceneRef.current.clientWidth;
        const height = sceneRef.current.clientHeight;

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width,
                height,
                wireframes: false,
                background: 'transparent', // We will render DOM elements on top
                pixelRatio: window.devicePixelRatio
            }
        });
        renderRef.current = render;

        // 2. Create Bodies (Tags)
        const tagBodies: Matter.Body[] = [];
        const scaleColors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#60a5fa'];

        tags.slice(0, 15).forEach((tag, i) => {
            // Heuristic size based on text length + padding
            const boxWidth = Math.max(80, tag.tag.length * 14 + 40);
            const boxHeight = 44;

            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * (height - 100) + 50;

            const body = Bodies.rectangle(x, y, boxWidth, boxHeight, {
                chamfer: { radius: 20 }, // Rounded corners physics
                restitution: 0.8, // Bouncy
                frictionAir: 0.02, // Slow down bit
                render: { visible: false }, // We hide physics body, show DOM
                label: tag.tag
            });

            // Attach data for DOM sync
            (body as any).tagData = {
                tag: tag.tag,
                count: tag.count,
                width: boxWidth,
                height: boxHeight,
                color: scaleColors[i % scaleColors.length]
            };

            tagBodies.push(body);
        });

        // 3. Create Walls
        const wallOptions = {
            isStatic: true,
            render: { visible: false },
            restitution: 1.0
        };
        const ground = Bodies.rectangle(width / 2, height + 30, width, 60, wallOptions);
        const ceiling = Bodies.rectangle(width / 2, -30, width, 60, wallOptions);
        const leftWall = Bodies.rectangle(-30, height / 2, 60, height, wallOptions);
        const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height, wallOptions);

        Composite.add(engine.world, [...tagBodies, ground, ceiling, leftWall, rightWall]);

        // 4. Mouse Interaction
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        // Allow scrolling on other parts
        mouseConstraint.mouse.element.removeEventListener("mousewheel", (mouseConstraint.mouse as any).mousewheel);
        mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", (mouseConstraint.mouse as any).mousewheel);


        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        // 5. Run
        Render.run(render);
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // 6. Sync Loop
        const updateSync = () => {
            const rawBodies = Composite.allBodies(engine.world); // includes walls
            const syncData = rawBodies
                .filter(b => (b as any).tagData) // Only tag bodies
                .map(b => ({
                    id: b.id,
                    x: b.position.x,
                    y: b.position.y,
                    angle: b.angle,
                    ...(b as any).tagData
                }));
            setBodies(syncData);
        };

        Events.on(engine, 'afterUpdate', updateSync);

        // Cleanup
        return () => {
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) render.canvas.remove();
        };

    }, [tags]);


    return (
        <div className={`relative w-full h-[400px] overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 ${className}`}>
            {/* Matter.js Canvas Container (Transparent, for interactions) */}
            <div ref={sceneRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

            {/* DOM Elements Synced to Physics */}
            {bodies.map(b => (
                <div
                    key={b.id}
                    className="absolute flex items-center justify-center shadow-lg pointer-events-none select-none text-white font-bold tracking-wide"
                    style={{
                        transform: `translate(${b.x - b.width / 2}px, ${b.y - b.height / 2}px) rotate(${b.angle}rad)`,
                        width: `${b.width}px`,
                        height: `${b.height}px`,
                        backgroundColor: b.color,
                        borderRadius: '9999px', // Pill shape
                        willChange: 'transform' // Optimise
                    }}
                >
                    {b.tag}
                    <span className="ml-2 text-xs opacity-80 bg-black/20 px-1.5 py-0.5 rounded-full">{b.count}</span>
                </div>
            ))}

            <div className="absolute bottom-4 right-6 text-xs text-neutral-400 font-mono pointer-events-none">
                인터랙티브 무중력 존
            </div>
        </div>
    );
}
