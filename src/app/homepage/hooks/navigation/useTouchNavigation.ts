/**
 * Hook for handling touch-based navigation on mobile
 * Manages swipe gestures with velocity detection
 */

import { useCallback, useRef } from "react";
import { RESTING_POINTS, SWIPE_THRESHOLDS } from "../../constants";
import type { TouchStartData } from "../../types";

export interface UseTouchNavigationOptions {
	isMobile: boolean;
	enabled: boolean;
	mobileSection: number;
	hasPassedGreeting: boolean;
	scrollProgress: number;
	setHasPassedGreeting: (value: boolean) => void;
	setScrollProgress: (value: number) => void;
	setActiveSection: (value: number) => void;
	setMobileSection: (value: number) => void;
	animateToProgress: (targetProgress: number, startProgress?: number, duration?: number) => void;
	isSnappingRef: React.MutableRefObject<boolean>;
}

export interface UseTouchNavigationState {
	handleTouchStart: (e: TouchEvent) => void;
	handleTouchMove: (e: TouchEvent) => void;
	handleTouchEnd: (e: TouchEvent) => void;
}

/**
 * Handles touch gestures for mobile horizontal swiping
 * Includes velocity-based snapping and smooth animations
 */
export function useTouchNavigation({
	isMobile,
	enabled,
	mobileSection,
	hasPassedGreeting,
	scrollProgress,
	setHasPassedGreeting,
	setScrollProgress,
	setActiveSection,
	setMobileSection,
	animateToProgress,
	isSnappingRef,
}: UseTouchNavigationOptions): UseTouchNavigationState {
	const touchStartRef = useRef<TouchStartData | null>(null);

	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			if (!isMobile || !enabled || isSnappingRef.current) return;
			const now = performance.now();
			touchStartRef.current = {
				x: e.touches[0].clientX,
				time: now,
				section: mobileSection,
				lastX: e.touches[0].clientX,
				lastTime: now,
			};
		},
		[isMobile, enabled, mobileSection, isSnappingRef]
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!isMobile || !touchStartRef.current || !enabled || isSnappingRef.current) return;

			const currentX = e.touches[0].clientX;
			const now = performance.now();
			const deltaX = touchStartRef.current.x - currentX;
			const viewportWidth = window.innerWidth;

			// Update lastX and lastTime for velocity tracking
			touchStartRef.current.lastX = currentX;
			touchStartRef.current.lastTime = now;

			const progressDelta = (deltaX / viewportWidth) * 1;

			const startSection = touchStartRef.current.section;
			let baseProgress: number;
			if (startSection === -1) {
				baseProgress = 0;
			} else {
				baseProgress = RESTING_POINTS[startSection];
			}

			let newProgress = baseProgress + progressDelta;

			const minProgress = hasPassedGreeting ? RESTING_POINTS[0] : 0;
			const maxProgress = RESTING_POINTS[2];
			newProgress = Math.max(minProgress, Math.min(maxProgress, newProgress));

			if (newProgress >= 0.5 && !hasPassedGreeting) {
				setHasPassedGreeting(true);
			}

			setScrollProgress(newProgress);

			if (newProgress < RESTING_POINTS[0] + 0.5) {
				setActiveSection(0);
			} else if (newProgress < RESTING_POINTS[1] + 0.5) {
				setActiveSection(1);
			} else {
				setActiveSection(2);
			}

			e.preventDefault();
		},
		[isMobile, enabled, hasPassedGreeting, isSnappingRef, setHasPassedGreeting, setScrollProgress, setActiveSection]
	);

	const handleTouchEnd = useCallback(
		(e: TouchEvent) => {
			if (!isMobile || !touchStartRef.current || !enabled) return;

			const endX = e.changedTouches[0].clientX;
			const endTime = performance.now();
			const startSection = touchStartRef.current.section;

			const recentDeltaX = touchStartRef.current.lastX - endX;
			const recentDeltaTime = endTime - touchStartRef.current.lastTime;
			const velocity = recentDeltaTime > 0 ? recentDeltaX / recentDeltaTime : 0;

			const totalDeltaX = touchStartRef.current.x - endX;

			touchStartRef.current = null;

			const currentProgress = scrollProgress;
			const viewportWidth = window.innerWidth;
			const distanceFraction = Math.abs(totalDeltaX) / viewportWidth;

			let targetSection: number;

			if (startSection === -1) {
				targetSection = 0;
				setHasPassedGreeting(true);
			} else {
				if (
					velocity > SWIPE_THRESHOLDS.velocity ||
					(totalDeltaX > 0 && distanceFraction > SWIPE_THRESHOLDS.distance)
				) {
					targetSection = Math.min(2, startSection + 1);
				} else if (
					velocity < -SWIPE_THRESHOLDS.velocity ||
					(totalDeltaX < 0 && distanceFraction > SWIPE_THRESHOLDS.distance)
				) {
					targetSection = Math.max(0, startSection - 1);
				} else {
					targetSection = startSection;
				}
			}

			const targetProgress = RESTING_POINTS[targetSection];
			setMobileSection(targetSection);
			animateToProgress(targetProgress, currentProgress, 350);
		},
		[isMobile, enabled, scrollProgress, setHasPassedGreeting, setMobileSection, animateToProgress]
	);

	return {
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
	};
}
