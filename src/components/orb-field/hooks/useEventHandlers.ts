"use client";

// =============================================================================
// useEventHandlers - Hook for global event handling (mouse, touch, visibility)
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { type WindowSize } from '../shared/types';

/**
 * Return values from the event handlers hook.
 */
interface UseEventHandlersReturn {
	/** Current window dimensions. */
	windowSize: WindowSize;
	/** Ref to current mouse position (null when not hovering). */
	mousePosRef: React.MutableRefObject<{ x: number; y: number } | null>;
	/** Ref to whether the page/tab is currently visible and focused. */
	isPageVisibleRef: React.MutableRefObject<boolean>;
	/** Whether the component has mounted. */
	isMounted: boolean;
}

/**
 * Manages global event handlers for the orb field.
 * 
 * Handles:
 * - Window resize events
 * - Global mouse/touch tracking (for orb repulsion)
 * - Page visibility and focus tracking (for pausing spawning)
 * - Mount state tracking
 * 
 * @returns Current event-derived state and refs.
 */
export function useEventHandlers(): UseEventHandlersReturn {
	const [windowSize, setWindowSize] = useState<WindowSize>({ width: 0, height: 0 });
	const [isMounted, setIsMounted] = useState(false);
	const mousePosRef = useRef<{ x: number; y: number } | null>(null);
	const isPageVisibleRef = useRef(typeof document !== 'undefined' ? !document.hidden : true);

	useEffect(() => {
		const frameId = requestAnimationFrame(() => setIsMounted(true));

		if (typeof window === 'undefined') {
			return () => cancelAnimationFrame(frameId);
		}

		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			setWindowSize({ width, height });
		};

		// Global mouse tracking for orb repulsion (works even when canvas has pointerEvents: none)
		const handleGlobalMouseMove = (e: MouseEvent) => {
			mousePosRef.current = { x: e.clientX, y: e.clientY };
		};

		const handleGlobalMouseLeave = () => {
			mousePosRef.current = null;
		};

		// Global touch tracking for orb repulsion on mobile (same behavior as mouse)
		const handleGlobalTouchMove = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				const touch = e.touches[0];
				mousePosRef.current = { x: touch.clientX, y: touch.clientY };
			}
		};

		const handleGlobalTouchStart = (e: TouchEvent) => {
			if (e.touches.length > 0) {
				const touch = e.touches[0];
				mousePosRef.current = { x: touch.clientX, y: touch.clientY };
			}
		};

		const handleGlobalTouchEnd = () => {
			mousePosRef.current = null;
		};

		// Track page visibility AND window focus to pause spawning when inactive
		const updateVisibility = () => {
			const isVisible = document.hasFocus() && !document.hidden;
			isPageVisibleRef.current = isVisible;
		};

		const handleVisibilityChange = () => {
			updateVisibility();
		};

		const handleWindowFocus = () => {
			isPageVisibleRef.current = !document.hidden;
		};

		const handleWindowBlur = () => {
			isPageVisibleRef.current = false;
		};

		// Set initial visibility state
		updateVisibility();

		handleResize();
		window.addEventListener('resize', handleResize);
		window.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseleave', handleGlobalMouseLeave);
		window.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
		window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
		window.addEventListener('touchend', handleGlobalTouchEnd);
		window.addEventListener('touchcancel', handleGlobalTouchEnd);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', handleWindowFocus);
		window.addEventListener('blur', handleWindowBlur);

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseleave', handleGlobalMouseLeave);
			window.removeEventListener('touchstart', handleGlobalTouchStart);
			window.removeEventListener('touchmove', handleGlobalTouchMove);
			window.removeEventListener('touchend', handleGlobalTouchEnd);
			window.removeEventListener('touchcancel', handleGlobalTouchEnd);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', handleWindowFocus);
			window.removeEventListener('blur', handleWindowBlur);
			cancelAnimationFrame(frameId);
		};
	}, []);

	return {
		windowSize,
		mousePosRef,
		isPageVisibleRef,
		isMounted,
	};
}
