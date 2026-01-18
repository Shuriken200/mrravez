"use client";

// =============================================================================
// useOpacityFade - Opacity fade calculation
// =============================================================================

import { useRef, useEffect, useCallback } from 'react';
import { DEFAULT_ORBFIELD_CONFIG } from '../shared/config';

/**
 * Parameters for opacity fade calculation.
 */
interface OpacityFadeParams {
	/** Base opacity value. */
	baseOpacity: number;
	/** Animation progress (0 to 1). */
	easedProgress: number;
	/** Whether debug mode is enabled. */
	isDebugMode: boolean;
}

/**
 * Calculates and applies opacity fade based on animation progress.
 * 
 * Single Responsibility: Opacity calculation only.
 */
export function useOpacityFade() {
	const opacityRef = useRef(1);

	const calculateOpacity = useCallback(({ baseOpacity, easedProgress, isDebugMode }: OpacityFadeParams): number => {
		if (isDebugMode) {
			return 1;
		}

		const fadeStart = DEFAULT_ORBFIELD_CONFIG.fadeOutStart;
		if (easedProgress > fadeStart) {
			const fadeFactor = (easedProgress - fadeStart) / (1 - fadeStart);
			return baseOpacity * (1 - fadeFactor);
		}

		return baseOpacity;
	}, []);

	const updateOpacity = useCallback((canvas: HTMLCanvasElement | null, opacity: number): void => {
		if (canvas) {
			canvas.style.opacity = opacity.toString();
		}
	}, []);

	return {
		calculateOpacity,
		updateOpacity,
		opacityRef,
	};
}

/**
 * Hook to sync opacity ref with prop value.
 */
export function useOpacityRef(opacity: number) {
	const opacityRef = useRef(opacity);
	useEffect(() => { opacityRef.current = opacity; }, [opacity]);
	return opacityRef;
}
