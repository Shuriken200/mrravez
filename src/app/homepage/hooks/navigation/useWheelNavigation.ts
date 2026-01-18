/**
 * Hook for handling mouse wheel navigation with configurable sensitivity
 * Cancels snap animations and applies scroll with multiplier
 */

import { useCallback, useRef } from "react";
import { transitionConfig } from "../../config";
import { RESTING_POINTS } from "../../constants";

export interface UseWheelNavigationOptions {
	isMobile: boolean;
	hasPassedGreeting: boolean;
	cancelSnap: () => void;
	isProgrammaticScrollRef: React.MutableRefObject<boolean>;
	isSnappingRef: React.MutableRefObject<boolean>;
	snapTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
	lastUserScrollRef: React.MutableRefObject<number>;
}

export interface UseWheelNavigationState {
	handleWheel: (e: WheelEvent) => void;
}

/**
 * Handles wheel events with enhanced sensitivity and snap cancellation
 */
export function useWheelNavigation({
	isMobile,
	hasPassedGreeting,
	cancelSnap,
	isProgrammaticScrollRef,
	isSnappingRef,
	snapTimeoutRef,
	lastUserScrollRef,
}: UseWheelNavigationOptions): UseWheelNavigationState {
	const accumulatedDeltaRef = useRef(0);

	const handleWheel = useCallback(
		(e: WheelEvent) => {
			if (isMobile) return;

			// Don't interfere with programmatic animations (dot clicks, keyboard nav)
			if (isProgrammaticScrollRef.current) return;

			// Cancel any ongoing snap (user wheel takes priority)
			if (isSnappingRef.current) {
				cancelSnap();
			}

			if (snapTimeoutRef.current) {
				clearTimeout(snapTimeoutRef.current);
				snapTimeoutRef.current = undefined;
			}

			lastUserScrollRef.current = performance.now();

			// Accumulate delta for programmatic scroll with sensitivity multiplier
			accumulatedDeltaRef.current += e.deltaY * transitionConfig.scrollSensitivity;

			// Apply accumulated scroll in next frame
			requestAnimationFrame(() => {
				if (accumulatedDeltaRef.current !== 0) {
					const currentScroll = window.scrollY;
					let newScroll = currentScroll + accumulatedDeltaRef.current;

					// Clamp to valid range
					const minScroll = hasPassedGreeting ? RESTING_POINTS[0] * window.innerHeight : 0;
					const maxScroll = RESTING_POINTS[2] * window.innerHeight;
					newScroll = Math.max(minScroll, Math.min(maxScroll, newScroll));

					window.scrollTo({
						top: newScroll,
						behavior: "instant" as ScrollBehavior,
					});

					accumulatedDeltaRef.current = 0;
				}
			});
		},
		[isMobile, cancelSnap, hasPassedGreeting, isProgrammaticScrollRef, isSnappingRef, snapTimeoutRef, lastUserScrollRef]
	);

	return { handleWheel };
}
