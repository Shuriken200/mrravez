"use client";

import { useEffect, useState } from "react";
import { STAGE_TIMINGS } from "../constants";
import { introStorage } from "../services";
import type { AnimationStagesState, AnimationStagesOptions } from "../types";

/**
 * Hook to manage the timed animation stage transitions
 * Stage 0: Initial state
 * Stage 1: Hi! emerging (growing from tiny)
 * Stage 2: Hi! popped (burst)
 * Stage 3: Hi! fading out
 * Stage 4: Hi! fully gone, Welcome starts appearing
 * Stage 5: Welcome fully visible
 * Stage 6: Welcome starts fading out
 * Stage 7: Welcome fully gone, about card appears
 * 
 * Refactored to use IntroStorageService abstraction for persistence
 * 
 * @param options.skipAnimation - If true, skip directly to stage 7 (ready state)
 */
export function useAnimationStages(options?: AnimationStagesOptions): AnimationStagesState {
	// Check if we should skip based on explicit option OR storage
	const [shouldSkip, setShouldSkip] = useState(() => {
		// Start with explicit skip option if provided
		if (options?.skipAnimation) return true;
		// Check storage on mount (SSR-safe with initial false)
		if (typeof window !== "undefined") {
			return introStorage.hasIntroBeenPlayed();
		}
		return false;
	});

	const [stage, setStage] = useState(shouldSkip ? 7 : 0);

	// Re-check storage on client mount (handles SSR mismatch)
	useEffect(() => {
		if (!options?.skipAnimation && introStorage.hasIntroBeenPlayed()) {
			// Use microtask to avoid synchronous setState warning
			queueMicrotask(() => {
				setShouldSkip(true);
				setStage(7);
			});
		}
	}, [options?.skipAnimation]);

	useEffect(() => {
		// Skip all animations if requested
		if (shouldSkip) {
			return;
		}

		const timer1 = setTimeout(() => setStage(1), STAGE_TIMINGS.stage1);
		const timer2 = setTimeout(() => setStage(2), STAGE_TIMINGS.stage2);
		const timer3 = setTimeout(() => setStage(3), STAGE_TIMINGS.stage3);
		const timer4 = setTimeout(() => setStage(4), STAGE_TIMINGS.stage4);
		const timer5 = setTimeout(() => setStage(5), STAGE_TIMINGS.stage5);
		const timer6 = setTimeout(() => setStage(6), STAGE_TIMINGS.stage6);
		const timer7 = setTimeout(() => {
			setStage(7);
			// Mark intro as played when animation completes
			introStorage.markIntroAsPlayed();
		}, STAGE_TIMINGS.stage7);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
			clearTimeout(timer3);
			clearTimeout(timer4);
			clearTimeout(timer5);
			clearTimeout(timer6);
			clearTimeout(timer7);
		};
	}, [shouldSkip]);

	return {
		stage,
		isReady: stage >= 7,
	};
}
