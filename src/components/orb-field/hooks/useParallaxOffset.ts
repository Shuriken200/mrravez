"use client";

// =============================================================================
// useParallaxOffset - Hook for parallax scroll and device tilt offset
// =============================================================================

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { DEFAULT_PARALLAX_CONFIG, type ParallaxConfig } from '../shared/config';

/**
 * Return type for the parallax offset hook.
 */
export interface UseParallaxOffsetReturn {
	/** Ref to current smoothly interpolated offset values { x, y }. */
	currentScrollOffsetRef: React.RefObject<{ x: number; y: number }>;
	/** Function to update offset - call this from the main render loop each frame. */
	updateParallaxOffset: () => void;
}

/**
 * Manages parallax offset calculations for smooth grid/orb movement.
 * Combines scroll progress and device tilt into smoothly interpolated offsets.
 * 
 * IMPORTANT: Does NOT run its own animation loop. Call updateParallaxOffset()
 * from the main render loop each frame for smooth interpolation.
 * 
 * @param scrollProgress - Current scroll/swipe progress (0.75 to 2.75 range).
 * @param isMobile - Whether device is mobile (affects scroll direction).
 * @param deviceTiltX - Device tilt X (0-1, 0.5 = center).
 * @param deviceTiltY - Device tilt Y (0-1, 0.5 = center).
 * @param config - Optional parallax configuration overrides.
 * @returns Object with ref and update function.
 */
export function useParallaxOffset(
	scrollProgress: number,
	isMobile: boolean,
	deviceTiltX: number,
	deviceTiltY: number,
	config: Partial<ParallaxConfig> = {}
): UseParallaxOffsetReturn {
	const fullConfig = useMemo(() => ({ ...DEFAULT_PARALLAX_CONFIG, ...config }), [config]);
	const currentScrollOffsetRef = useRef({ x: 0, y: 0 });

	// Store parameters in refs for stable callback access
	const scrollProgressRef = useRef(scrollProgress);
	const isMobileRef = useRef(isMobile);
	const deviceTiltXRef = useRef(deviceTiltX);
	const deviceTiltYRef = useRef(deviceTiltY);
	const configRef = useRef(fullConfig);

	// Sync refs with props
	useEffect(() => { scrollProgressRef.current = scrollProgress; }, [scrollProgress]);
	useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);
	useEffect(() => { deviceTiltXRef.current = deviceTiltX; }, [deviceTiltX]);
	useEffect(() => { deviceTiltYRef.current = deviceTiltY; }, [deviceTiltY]);
	useEffect(() => { configRef.current = fullConfig; }, [fullConfig]);

	/**
	 * Updates the parallax offset. Call this from the main render loop each frame.
	 * Reads from refs for stable callback reference.
	 */
	const updateParallaxOffset = useCallback(() => {
		const cfg = configRef.current;
		const sp = scrollProgressRef.current;
		const mobile = isMobileRef.current;
		const tiltX = deviceTiltXRef.current;
		const tiltY = deviceTiltYRef.current;

		// Calculate target parallax offset based on scroll progress
		// Desktop: vertical offset (move up as scroll increases)
		// Mobile: horizontal offset (move left as scroll increases)
		const scrollOffset = -(sp - cfg.scrollOffsetReference) * cfg.scrollOffsetPxPerUnit;
		const scrollTargetOffsetX = mobile ? scrollOffset : 0;
		const scrollTargetOffsetY = mobile ? 0 : scrollOffset;

		// Device tilt offset: move grid opposite to tilt direction
		// tiltX/Y are 0-1 where 0.5 = center, so center them and scale
		const tiltOffsetX = (tiltX - 0.5) * 2 * cfg.deviceTiltOffsetPx;
		const tiltOffsetY = (tiltY - 0.5) * 2 * cfg.deviceTiltOffsetPx;

		// Combine scroll and tilt offsets
		const targetOffsetX = scrollTargetOffsetX + tiltOffsetX;
		const targetOffsetY = scrollTargetOffsetY + tiltOffsetY;

		// Smoothly interpolate toward target offset for buttery animation
		const current = currentScrollOffsetRef.current;
		current.x += (targetOffsetX - current.x) * cfg.scrollOffsetSmoothing;
		current.y += (targetOffsetY - current.y) * cfg.scrollOffsetSmoothing;
	}, []);

	return {
		currentScrollOffsetRef,
		updateParallaxOffset,
	};
}
