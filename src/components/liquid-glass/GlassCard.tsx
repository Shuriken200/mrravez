"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { GlassProvider } from "./GlassContext";
import "@/lib/liquid-glass/glass.css";

interface GlassCardProps {
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    borderRadius?: number;
    tintOpacity?: number;
    type?: 'rounded' | 'circle' | 'pill';
}

export function GlassCard({
    children,
    className,
    style,
    borderRadius = 24,
    tintOpacity = 0.2,
    type = 'rounded'
}: GlassCardProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (!mountRef.current) return;

            // Load html2canvas
            const html2canvas = (await import("html2canvas")).default;
            window.html2canvas = html2canvas;

            // Import Container
            const { Container } = await import("@/lib/liquid-glass");

            if (!mounted || !mountRef.current) return;

            // Wait for images
            const images = document.querySelectorAll('img');
            await Promise.all(
                Array.from(images).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );

            await new Promise(r => setTimeout(r, 200));

            if (!mounted) return;

            // Reset snapshot for fresh capture
            Container.pageSnapshot = null;

            // Create Container
            const instance = new Container({
                type,
                borderRadius,
                tintOpacity
            });

            containerRef.current = instance;

            if (instance.element) {
                // Ensure full width in wrapper
                instance.element.style.width = '100%';

                // CRITICAL: Glass element background should NOT capture pointers effectively
                // But we need it to be visible. Children (content) need 'auto'.
                instance.element.style.pointerEvents = 'none';

                // 3D Tilt Logic
                const handleMove = (e: MouseEvent) => {
                    if (!containerRef.current || !mountRef.current) return;

                    const rect = mountRef.current.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    const mouseX = e.clientX - centerX;
                    const mouseY = e.clientY - centerY;

                    // Max tilt (degrees)
                    const maxTilt = 3;

                    // X rotation (tilting up/down) depends on Y distance
                    const rotateX = (mouseY / (rect.height / 2)) * -maxTilt;

                    // Y rotation (tilting left/right) depends on X distance
                    const rotateY = (mouseX / (rect.width / 2)) * maxTilt;

                    if (instance.element) {
                        instance.element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
                        instance.element.style.transition = 'transform 0.1s ease-out';
                    }
                };

                const handleLeave = () => {
                    if (instance.element) {
                        instance.element.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                        instance.element.style.transition = 'transform 0.5s ease-out';
                    }
                };

                const handleEnter = () => {
                    if (instance.element) {
                        instance.element.style.transition = 'transform 0.1s ease-out';
                    }
                };

                const wrapper = mountRef.current;
                wrapper.addEventListener('mousemove', handleMove);
                wrapper.addEventListener('mouseleave', handleLeave);
                wrapper.addEventListener('mouseenter', handleEnter);

                (instance as any)._cleanupListeners = () => {
                    wrapper.removeEventListener('mousemove', handleMove);
                    wrapper.removeEventListener('mouseleave', handleLeave);
                    wrapper.removeEventListener('mouseenter', handleEnter);
                };

                // Default flex column layout for children
                instance.element.style.flexDirection = 'column';
                instance.element.style.transformStyle = 'preserve-3d'; // Enable 3D space for children levitation

                mountRef.current.appendChild(instance.element);
                setIsReady(true);
            }
        };

        init();

        return () => {
            mounted = false;
            if (containerRef.current) {
                if ((containerRef.current as any)._cleanupListeners) {
                    (containerRef.current as any)._cleanupListeners();
                }
                if (containerRef.current.element?.parentNode) {
                    containerRef.current.element.parentNode.removeChild(containerRef.current.element);
                }
            }
            containerRef.current = null;
        };
    }, [type, borderRadius, tintOpacity]);

    // Apply dynamic styles when style prop changes
    useEffect(() => {
        if (containerRef.current?.element && style) {
            Object.assign(containerRef.current.element.style, style);
        }
    }, [style]);

    return (
        <div
            ref={mountRef}
            className={className}
            style={{
                position: 'relative',
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                ...style
            }}
        >
            {isReady && (
                <GlassProvider container={containerRef.current}>
                    <GlassCardContent container={containerRef.current}>
                        {children}
                    </GlassCardContent>
                </GlassProvider>
            )}
        </div>
    );
}

function GlassCardContent({ container, children }: { container: any; children: ReactNode }) {
    const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!container?.element) return;

        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.zIndex = '1';
        div.style.width = '100%';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '16px';

        // CRITICAL: Re-enable pointer events for the content so buttons inside work.
        // The parent (glass element) has pointer-events: none.
        div.style.pointerEvents = 'auto';

        // Levitate content subtly (10px) to ensure it catches clicks without visual distortion
        div.style.transform = 'translateZ(10px)';

        container.element.appendChild(div);
        setContentEl(div);

        // Use ResizeObserver to keep container sized to content
        const observer = new ResizeObserver(() => {
            container.updateSizeFromDOM();
        });
        observer.observe(div);
        observer.observe(container.element);

        // Initial size update
        requestAnimationFrame(() => {
            container.updateSizeFromDOM();
        });

        return () => {
            observer.disconnect();
            if (div.parentNode) div.parentNode.removeChild(div);
        };
    }, [container]);

    if (!contentEl) return null;
    return createPortal(children, contentEl);
}
