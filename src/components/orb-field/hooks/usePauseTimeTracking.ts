"use client";

// =============================================================================
// usePauseTimeTracking - Tracks pause/resume time offsets
// =============================================================================

import { useRef } from 'react';

/**
 * Pause time tracking refs.
 */
export interface PauseTimeRefs {
	pausedAtTimeRef: React.RefObject<number | null>;
	pausedTimeOffsetRef: React.RefObject<number>;
}

/**
 * Return values from the pause time tracking hook.
 */
export interface UsePauseTimeTrackingReturn extends PauseTimeRefs {
	/** Handles pause state change. */
	handlePauseChange: (wasPaused: boolean, isPaused: boolean) => void;
}

/**
 * Tracks pause time offset for animation freezing.
 * 
 * Single Responsibility: Pause time tracking only.
 */
export function usePauseTimeTracking(): UsePauseTimeTrackingReturn {
	const pausedAtTimeRef = useRef<number | null>(null);
	const pausedTimeOffsetRef = useRef(0);

	/**
	 * Handles pause state changes, updating time offsets.
	 */
	const handlePauseChange = (wasPaused: boolean, isPaused: boolean): void => {
		if (!wasPaused && isPaused) {
			pausedAtTimeRef.current = performance.now();
		} else if (wasPaused && !isPaused) {
			if (pausedAtTimeRef.current !== null) {
				pausedTimeOffsetRef.current += performance.now() - pausedAtTimeRef.current;
				pausedAtTimeRef.current = null;
			}
		}
	};

	return {
		pausedAtTimeRef,
		pausedTimeOffsetRef,
		handlePauseChange,
	};
}

/**
 * Get the effective time for animations.
 * When paused, returns the frozen time (time at pause).
 * When not paused, returns current time minus accumulated pause duration.
 */
export function getEffectiveTime(
	pausePhysicsRef: React.RefObject<boolean>,
	pausedAtTimeRef: React.RefObject<number | null>,
	pausedTimeOffsetRef: React.RefObject<number>
): number {
	const now = performance.now();
	if (pausePhysicsRef.current && pausedAtTimeRef.current !== null) {
		return pausedAtTimeRef.current - pausedTimeOffsetRef.current;
	}
	return now - pausedTimeOffsetRef.current;
}
