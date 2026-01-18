/**
 * Hook for managing initial fade-in animation for cards
 * Ensures smooth transition from hidden to visible state
 */

import { useState, useEffect } from "react";
import { transitionConfig } from "../../config";

export interface UseFadeInOptions {
	isReady: boolean;
}

export interface UseFadeInState {
	hasFadedIn: boolean;
	wrapperStyle: React.CSSProperties;
}

/**
 * Manages the initial fade-in animation for the card carousel
 * Uses double RAF to ensure browser has painted initial state
 */
export function useFadeIn({ isReady }: UseFadeInOptions): UseFadeInState {
	const [hasFadedIn, setHasFadedIn] = useState(false);

	useEffect(() => {
		if (isReady && !hasFadedIn) {
			// Double RAF + small timeout ensures browser has painted initial state
			const timer = requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(() => {
						setHasFadedIn(true);
					}, transitionConfig.fadeInDelay);
				});
			});
			return () => cancelAnimationFrame(timer);
		}
	}, [isReady, hasFadedIn]);

	const wrapperStyle: React.CSSProperties = {
		position: 'relative',
		zIndex: 10,
		opacity: hasFadedIn ? 1 : 0,
		transition: `opacity ${transitionConfig.cardTransitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
		willChange: 'opacity',
	};

	return {
		hasFadedIn,
		wrapperStyle,
	};
}
