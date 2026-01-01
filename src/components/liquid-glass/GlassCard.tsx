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
    padding?: string | number;
}

export function GlassCard({
    children,
    className,
    style,
    borderRadius = 24,
    tintOpacity = 0.2,
    type = 'rounded',
    padding
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

                // CRITICAL: Glass element background should NOT capture pointers effectively
                // But we need it to be visible. Children (content) need 'auto'.
                instance.element.style.pointerEvents = 'none';

                // 3D Tilt Logic with smooth tracking
                let isEntering = false;
                let enterTimeout: number | null = null;
                let currentRotateX = 0;
                let currentRotateY = 0;
                const smoothingFactor = 0.15; // Lower = smoother but slower response

                const handleMove = (e: MouseEvent) => {
                    if (!containerRef.current || !mountRef.current || isEntering) return;

                    const rect = mountRef.current.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    const mouseX = e.clientX - centerX;
                    const mouseY = e.clientY - centerY;

                    // Max tilt (degrees)
                    const maxTilt = 3;

                    // Calculate target rotations
                    const targetRotateX = (mouseY / (rect.height / 2)) * -maxTilt;
                    const targetRotateY = (mouseX / (rect.width / 2)) * maxTilt;

                    // Lerp toward target (smooth interpolation)
                    currentRotateX += (targetRotateX - currentRotateX) * smoothingFactor;
                    currentRotateY += (targetRotateY - currentRotateY) * smoothingFactor;

                    if (instance.element) {
                        instance.element.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale3d(1.01, 1.01, 1.01)`;
                    }
                };

                const handleLeave = () => {
                    isEntering = false;
                    if (enterTimeout) {
                        cancelAnimationFrame(enterTimeout);
                        enterTimeout = null;
                    }
                    // Reset current rotation values
                    currentRotateX = 0;
                    currentRotateY = 0;
                    if (instance.element) {
                        instance.element.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                        instance.element.style.transition = 'transform 0.5s ease-out';
                    }
                };

                const handleEnter = () => {
                    if (instance.element) {
                        isEntering = true;
                        // Set smooth transition and ensure we start from neutral position
                        instance.element.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
                        instance.element.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

                        // Allow tilt tracking after a brief delay to ensure smooth start
                        enterTimeout = requestAnimationFrame(() => {
                            isEntering = false;
                        });
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
                instance.element.style.display = 'flex'; // Ensure flex
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

    return (
        <div
            ref={mountRef}
            className={className}
            style={{
                position: 'relative',
                perspective: '1200px',
                transformStyle: 'preserve-3d',
                willChange: 'transform', // Hint browser to optimize for transform changes
                ...style
            }}
        >
            {isReady && (
                <GlassProvider container={containerRef.current}>
                    <GlassCardContent container={containerRef.current} padding={padding}>
                        {children}
                    </GlassCardContent>
                </GlassProvider>
            )}
        </div>
    );
}

function GlassCardContent({ container, children, padding }: { container: any; children: ReactNode; padding?: string | number }) {
    const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!container?.element) return;

        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.zIndex = '1';
        div.style.width = '100%';
        div.style.height = '100%'; // Fill container
        div.style.boxSizing = 'border-box'; // Ensure padding is contained
        if (padding) {
            div.style.padding = typeof padding === 'number' ? `${padding}px` : padding;
        }

        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.gap = '16px';
        div.style.justifyContent = 'center'; // Center content vertically if card is fixed height

        // CRITICAL: Re-enable pointer events for the content so buttons inside work.
        // The parent (glass element) has pointer-events: none.
        div.style.pointerEvents = 'auto';

        // Levitate content subtly (10px) to ensure it catches clicks without visual distortion
        div.style.transform = 'translateZ(10px)';

        container.element.appendChild(div);
        setContentEl(div);

        // Use ResizeObserver to keep container sized to content
        // Note: calling updateSizeFromDOM might fight with explicit sizing if we aren't careful.
        // If wrapper has explicit size, text/glass should follow.
        const observer = new ResizeObserver(() => {
            // If the wrapper is fixed size, we probably don't need to drive size FROM dom,
            // but if it's auto size, we do.
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
    }, [container, padding]);

    if (!contentEl) return null;
    return createPortal(children, contentEl);
}
