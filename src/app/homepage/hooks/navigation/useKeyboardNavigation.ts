/**
 * Hook for handling keyboard navigation (arrow keys)
 * Provides instant response by canceling ongoing animations
 */

import { useCallback } from "react";

export interface UseKeyboardNavigationOptions {
	enabled: boolean;
	hasPassedGreeting: boolean;
	activeSection: number;
	navigateToSection: (targetSection: number, useEaseOut?: boolean) => void;
	cancelSnap: () => void;
	isSnappingRef: React.MutableRefObject<boolean>;
	snapTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
}

export interface UseKeyboardNavigationState {
	handleKeyDown: (e: KeyboardEvent) => void;
}

/**
 * Handles arrow key navigation between sections
 * Supports both up/down and left/right arrow keys
 */
export function useKeyboardNavigation({
	enabled,
	hasPassedGreeting,
	activeSection,
	navigateToSection,
	cancelSnap,
	isSnappingRef,
	snapTimeoutRef,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationState {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!enabled) return;

			// Don't trigger if user is typing in an input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			let targetSection: number | null = null;

			if (e.key === "ArrowDown" || e.key === "ArrowRight") {
				if (!hasPassedGreeting) {
					targetSection = 0;
				} else if (activeSection < 2) {
					targetSection = activeSection + 1;
				}
			} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
				if (hasPassedGreeting && activeSection > 0) {
					targetSection = activeSection - 1;
				}
			}

			if (targetSection !== null) {
				// Cancel any ongoing animations for immediate response
				cancelSnap();
				if (snapTimeoutRef.current) {
					clearTimeout(snapTimeoutRef.current);
					snapTimeoutRef.current = undefined;
				}

				// Reset snapping ref so navigateToSection doesn't block
				isSnappingRef.current = false;

				// Use ease-out for immediate visual feedback
				navigateToSection(targetSection, true);
			}
		},
		[enabled, hasPassedGreeting, activeSection, navigateToSection, cancelSnap, isSnappingRef, snapTimeoutRef]
	);

	return { handleKeyDown };
}
