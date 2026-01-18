/**
 * Hook for managing scroll delta state for orb animations
 * Tracks scroll velocity and decays it over time for smooth visual effects
 */

import { useEffect, useRef, useState } from "react";
import { transitionConfig } from "../config";

export interface UseScrollDeltaOptions {
	enabled: boolean;
	scrollProgress: number;
}

export interface UseScrollDeltaState {
	scrollDelta: number; // Normalized scroll velocity (-1 to 1)
}

/**
 * Tracks scroll progress changes and converts them to a decaying delta value
 * Used for orb reaction animations
 */
export function useScrollDelta({ enabled, scrollProgress }: UseScrollDeltaOptions): UseScrollDeltaState {
	const [scrollDelta, setScrollDelta] = useState(0);
	const scrollDeltaRef = useRef(0);
	const scrollDeltaDecayRef = useRef<number | undefined>(undefined);
	const previousScrollProgressRef = useRef(scrollProgress);

	// Decay scroll delta over time for smooth orb reaction
	useEffect(() => {
		const decayScrollDelta = () => {
			// Calculate progress delta for orb movement
			const progressDelta = scrollProgress - previousScrollProgressRef.current;
			previousScrollProgressRef.current = scrollProgress;

			// Update scroll delta based on progress change
			// Positive progressDelta = moving forward/down, negative = moving backward/up
			// Reduced from 50 to 15 for less aggressive orb movement
			if (Math.abs(progressDelta) > 0.0001) {
				scrollDeltaRef.current = Math.max(-1, Math.min(1, progressDelta * 15));
			}

			// Decay existing delta
			scrollDeltaRef.current *= transitionConfig.scrollDeltaDecay;
			if (Math.abs(scrollDeltaRef.current) < 0.001) {
				scrollDeltaRef.current = 0;
			}
			setScrollDelta(scrollDeltaRef.current);
			scrollDeltaDecayRef.current = requestAnimationFrame(decayScrollDelta);
		};

		if (enabled) {
			scrollDeltaDecayRef.current = requestAnimationFrame(decayScrollDelta);
		}

		return () => {
			if (scrollDeltaDecayRef.current) {
				cancelAnimationFrame(scrollDeltaDecayRef.current);
			}
		};
	}, [enabled, scrollProgress]);

	return { scrollDelta };
}
