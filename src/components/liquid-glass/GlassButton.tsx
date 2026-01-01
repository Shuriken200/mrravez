"use client";

import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGlassContainer } from "./GlassContext";

interface GlassButtonProps {
    children?: ReactNode;
    text?: string;
    onClick?: () => void;
    type?: 'rounded' | 'circle' | 'pill';
    size?: number;
    tintOpacity?: number;
    className?: string;
    style?: React.CSSProperties;
    href?: string;
    target?: string;
    rel?: string;
}

export function GlassButton({
    children,
    text = '',
    onClick,
    type = 'pill',
    size = 18,
    tintOpacity = 0.2,
    className,
    style,
    href,
    target,
    rel
}: GlassButtonProps) {
    const parentContainer = useGlassContainer();
    const mountRef = useRef<HTMLDivElement | HTMLAnchorElement>(null);
    const buttonRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);
    const animationRef = useRef<number | null>(null);

    // Initial base opacity
    const baseOpacity = tintOpacity;
    // Frostier opacity on hover
    const hoverOpacity = 0.6;

    // Animation Logic
    const animateFrosting = useCallback((targetOpacity: number) => {
        if (!buttonRef.current) return;

        const startOpacity = buttonRef.current.tintOpacity;
        const duration = 200; // 200ms - fast and snappy
        const startTime = performance.now();

        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-in-out cubic
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const current = startOpacity + (targetOpacity - startOpacity) * ease;

            if (buttonRef.current) {
                buttonRef.current.tintOpacity = current;
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(tick);
            } else {
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (!parentContainer || !mountRef.current) return;

        let mounted = true;

        const init = async () => {
            const { Button } = await import("@/lib/liquid-glass");

            if (!mounted || !mountRef.current) return;

            // Create Button
            const instance = new Button({
                text: text || ' ',
                size,
                type,
                tintOpacity: baseOpacity,
                onClick: onClick ? () => onClick() : undefined
            });

            buttonRef.current = instance;

            // Add as child to parent container for nested glass
            parentContainer.addChild(instance);

            if (instance.element) {
                // Ensure pointer events are auto so it can catch clicks
                instance.element.style.pointerEvents = 'auto';
                if (onClick) {
                    instance.element.style.cursor = 'pointer';
                }

                // Override the library's auto-sizing - allow flexible sizing
                instance.element.style.width = '';
                instance.element.style.height = '';
                instance.element.style.minWidth = '';
                instance.element.style.minHeight = '';
                instance.element.style.maxWidth = '';
                instance.element.style.maxHeight = '';

                // Apply user styles AFTER clearing auto-sizing
                if (style) {
                    Object.assign(instance.element.style, style);
                }
                if (className) {
                    className.split(' ').forEach(cls => {
                        if (cls) instance.element?.classList.add(cls);
                    });
                }

                // Hide default text if we have children
                if (children) {
                    const textEl = instance.element.querySelector('.glass-button-text');
                    if (textEl) (textEl as HTMLElement).style.display = 'none';
                }

                mountRef.current.appendChild(instance.element);

                // Add Event Listeners
                const handleEnter = () => animateFrosting(hoverOpacity);
                const handleLeave = () => animateFrosting(baseOpacity);
                const handleClick = (e: MouseEvent) => {
                    if (onClick) {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick();
                    }
                };

                instance.element.addEventListener('mouseenter', handleEnter);
                instance.element.addEventListener('mouseleave', handleLeave);
                instance.element.addEventListener('click', handleClick);

                // Attach cleanup to instance for removal
                (instance as any)._cleanupListeners = () => {
                    const el = instance.element;
                    if (el) {
                        el.removeEventListener('mouseenter', handleEnter);
                        el.removeEventListener('mouseleave', handleLeave);
                        el.removeEventListener('click', handleClick);
                    }
                };

                // Force size update after styles applied
                requestAnimationFrame(() => {
                    instance.updateSizeFromDOM();
                    setIsReady(true);
                });
            }
        };

        init();

        return () => {
            mounted = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);

            if (buttonRef.current && (buttonRef.current as any)._cleanupListeners) {
                (buttonRef.current as any)._cleanupListeners();
            }

            if (parentContainer && buttonRef.current) {
                parentContainer.removeChild(buttonRef.current);
            }
            if (buttonRef.current?.element?.parentNode) {
                buttonRef.current.element.parentNode.removeChild(buttonRef.current.element);
            }
            buttonRef.current = null;
        };
    }, [parentContainer, type, size, text, animateFrosting, baseOpacity, hoverOpacity]); // Removed onClick from dependencies

    // Update opacity if prop changes externally
    useEffect(() => {
        // Only update if not currently animating or hovering logic bypass
        if (buttonRef.current && !animationRef.current) {
            // We might want to respect the prop if it changes
            // But our local state controls hover.
            // For now, let's leave tintOpacity prop as just initial config or base.
        }
    }, [tintOpacity]);

    const Tag = href ? 'a' : 'div';

    // We cast mountRef to any here to satisfy TypeScript because the ref union type
    // isn't directly compatible with the specific element type in a dynamic tag scenario
    // without more complex typing.
    const refProps = { ref: mountRef as any };

    // Calculate border radius for focus ring
    const borderRadius = type === 'pill' ? 9999 : (type === 'circle' ? '50%' : size);

    // Common props for both tags
    const commonProps = {
        className: `${className || ''} glass-button-context`.trim(),
        style: {
            position: 'relative' as const,
            zIndex: 20,
            pointerEvents: 'auto' as const,
            borderRadius, // Ensure native outline matches shape
            ...(href ? {
                display: 'block',
                textDecoration: 'none'
            } : {}),
            ...style
        },
        onClick,
        onFocus: () => animateFrosting(hoverOpacity),
        onBlur: () => animateFrosting(baseOpacity)
    };

    // Anchor-specific props
    const anchorProps = href ? {
        href,
        target,
        rel
    } : {};

    return (
        <Tag
            {...refProps}
            {...commonProps}
            {...anchorProps}
        >
            {isReady && children && buttonRef.current?.element && (
                <ButtonContent button={buttonRef.current}>
                    {children}
                </ButtonContent>
            )}
        </Tag>
    );
}

// Render children into the button's element
function ButtonContent({ button, children }: { button: any; children: ReactNode }) {
    const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!button?.element) return;

        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.zIndex = '10'; // High Z-index for content
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.pointerEvents = 'none'; // Content shouldn't block button clicks, button element handles them.
        // Actually, if children are buttons/links, they need auto.
        // But GlassButton implies the button itself is the interactive unit. 
        // Let's set auto just in case nested clickable items exist.
        div.style.pointerEvents = 'auto';

        button.element.appendChild(div);
        setContentEl(div);

        // Trigger size update after content added
        requestAnimationFrame(() => {
            button.updateSizeFromDOM();
        });

        return () => {
            if (div.parentNode) div.parentNode.removeChild(div);
        };
    }, [button]);

    if (!contentEl) return null;
    return createPortal(children, contentEl);
}
