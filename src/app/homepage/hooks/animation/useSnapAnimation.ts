/**
 * Hook for managing snap animation to resting points
 * Provides parabolic easing for desktop and cubic easing for mobile
 */

import { useCallback } from "react";
import { transitionConfig } from "../../config";

export interface UseSnapAnimationOptions {
	isMobile: boolean;
	scrollProgress: number;
	updateActiveSection: (progress: number) => void;
	setScrollProgress: (progress: number) => void;
	setTransitionDirection: (direction: "forward" | "backward" | null) => void;
	isSnappingRef: React.MutableRefObject<boolean>;
	isProgrammaticScrollRef: React.MutableRefObject<boolean>;
	snapAnimationRef: React.MutableRefObject<number | undefined>;
}

export interface UseSnapAnimationState {
	animateToProgress: (
		targetProgress: number,
		startProgress?: number,
		duration?: number,
		useEaseOut?: boolean
	) => void;
	cancelSnap: () => void;
}

/**
 * Provides smooth animated transitions between scroll positions
 * Supports different easing curves for different interaction types
 */
export function useSnapAnimation({
	isMobile,
	scrollProgress,
	updateActiveSection,
	setScrollProgress,
	setTransitionDirection,
	isSnappingRef,
	isProgrammaticScrollRef,
	snapAnimationRef,
}: UseSnapAnimationOptions): UseSnapAnimationState {
	// Parabolic ball-rolling easing for desktop
	const parabolicBallEase = useCallback((t: number): number => {
		if (t < 0.4) {
			const nt = t / 0.4;
			return 0.3 * nt * nt * nt * nt;
		} else {
			const nt = (t - 0.4) / 0.6;
			return 0.3 + 0.7 * (1 - Math.pow(1 - nt, 3));
		}
	}, []);

	// Cancel any ongoing snap animation
	const cancelSnap = useCallback(() => {
		if (snapAnimationRef.current) {
			cancelAnimationFrame(snapAnimationRef.current);
			snapAnimationRef.current = undefined;
		}
		isSnappingRef.current = false;
		isProgrammaticScrollRef.current = false;
	}, [isSnappingRef, isProgrammaticScrollRef, snapAnimationRef]);

	// Smooth animated transition to a target progress
	const animateToProgress = useCallback(
		(targetProgress: number, startProgress?: number, duration?: number, useEaseOut?: boolean) => {
			const currentProgress =
				startProgress ?? (isMobile ? scrollProgress : window.scrollY / window.innerHeight);
			const distance = targetProgress - currentProgress;

			if (Math.abs(distance) < 0.01) {
				setScrollProgress(targetProgress);
				updateActiveSection(targetProgress);
				isSnappingRef.current = false;
				isProgrammaticScrollRef.current = false;
				return;
			}

			cancelSnap();
			isSnappingRef.current = true;
			isProgrammaticScrollRef.current = true;

			// Set transition direction
			setTransitionDirection(distance > 0 ? "forward" : "backward");

			// Calculate duration based on distance and configuration
			const config = transitionConfig;
			const effectiveDuration = duration !== undefined
				? duration
				: useEaseOut
					? config.dotClickDuration
					: isMobile
						? config.mobileSnapDuration.base
						: config.desktopSnapDuration.base;

			const minDuration = isMobile ? config.mobileSnapDuration.min : config.desktopSnapDuration.min;
			const maxDuration = isMobile ? config.mobileSnapDuration.max : config.desktopSnapDuration.max;
			const animDuration = Math.min(maxDuration, Math.max(minDuration, effectiveDuration, Math.abs(distance) * 500));

			const startTime = performance.now();

			const animate = (currentTime: number) => {
				if (!isSnappingRef.current) {
					isProgrammaticScrollRef.current = false;
					return;
				}

				const elapsed = currentTime - startTime;
				const progress = Math.min(elapsed / animDuration, 1);

				let eased: number;
				if (isMobile || useEaseOut) {
					// Ease-out cubic - starts fast, slows at end
					eased = 1 - Math.pow(1 - progress, 3);
				} else {
					// Parabolic ball-rolling for desktop scroll snapping
					eased = parabolicBallEase(progress);
				}

				const newProgress = currentProgress + distance * eased;

				if (!isMobile) {
					window.scrollTo({
						top: newProgress * window.innerHeight,
						behavior: "instant" as ScrollBehavior,
					});
				}

				setScrollProgress(newProgress);
				updateActiveSection(newProgress);

				if (progress < 1) {
					snapAnimationRef.current = requestAnimationFrame(animate);
				} else {
					if (!isMobile) {
						window.scrollTo({
							top: targetProgress * window.innerHeight,
							behavior: "instant" as ScrollBehavior,
						});
					}
					setScrollProgress(targetProgress);
					updateActiveSection(targetProgress);
					isSnappingRef.current = false;
					isProgrammaticScrollRef.current = false;
					snapAnimationRef.current = undefined;
					setTransitionDirection(null);
				}
			};

			snapAnimationRef.current = requestAnimationFrame(animate);
		},
		[
			isMobile,
			scrollProgress,
			parabolicBallEase,
			cancelSnap,
			updateActiveSection,
			setScrollProgress,
			setTransitionDirection,
			isSnappingRef,
			isProgrammaticScrollRef,
			snapAnimationRef,
		]
	);

	return {
		animateToProgress,
		cancelSnap,
	};
}
