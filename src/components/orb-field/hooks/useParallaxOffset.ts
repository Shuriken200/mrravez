"use client";

// =============================================================================
// useParallaxOffset - Hook for parallax scroll and device tilt offset
// =============================================================================

import { useEffect, useRef } from 'react';
import { DEFAULT_PARALLAX_CONFIG, type ParallaxConfig } from '../shared/config';

/**
 * Manages parallax offset calculations for smooth grid/orb movement.
 * Combines scroll progress and device tilt into smoothly interpolated offsets.
 * 
 * @param scrollProgress - Current scroll/swipe progress (0.75 to 2.75 range).
 * @param isMobile - Whether device is mobile (affects scroll direction).
 * @param deviceTiltX - Device tilt X (0-1, 0.5 = center).
 * @param deviceTiltY - Device tilt Y (0-1, 0.5 = center).
 * @param config - Optional parallax configuration overrides.
 * @returns Ref to current smoothly interpolated offset values { x, y }.
 */
export function useParallaxOffset(
	scrollProgress: number,
	isMobile: boolean,
	deviceTiltX: number,
	deviceTiltY: number,
	config: Partial<ParallaxConfig> = {}
): React.MutableRefObject<{ x: number; y: number }> {
	const fullConfig = { ...DEFAULT_PARALLAX_CONFIG, ...config };
	const currentScrollOffsetRef = useRef({ x: 0, y: 0 });

	useEffect(() => {
		let animationFrameId: number | null = null;

		const updateOffset = () => {
			// Calculate target parallax offset based on scroll progress
			// Desktop: vertical offset (move up as scroll increases)
			// Mobile: horizontal offset (move left as scroll increases)
			const scrollOffset = -(scrollProgress - fullConfig.scrollOffsetReference) * fullConfig.scrollOffsetPxPerUnit;
			const scrollTargetOffsetX = isMobile ? scrollOffset : 0;
			const scrollTargetOffsetY = isMobile ? 0 : scrollOffset;

			// Device tilt offset: move grid opposite to tilt direction
			// tiltX/Y are 0-1 where 0.5 = center, so center them and scale
			const tiltOffsetX = (deviceTiltX - 0.5) * 2 * fullConfig.deviceTiltOffsetPx;
			const tiltOffsetY = (deviceTiltY - 0.5) * 2 * fullConfig.deviceTiltOffsetPx;

			// Combine scroll and tilt offsets
			const targetOffsetX = scrollTargetOffsetX + tiltOffsetX;
			const targetOffsetY = scrollTargetOffsetY + tiltOffsetY;

			// Smoothly interpolate toward target offset for buttery animation
			const current = currentScrollOffsetRef.current;
			current.x += (targetOffsetX - current.x) * fullConfig.scrollOffsetSmoothing;
			current.y += (targetOffsetY - current.y) * fullConfig.scrollOffsetSmoothing;

			animationFrameId = requestAnimationFrame(updateOffset);
		};

		animationFrameId = requestAnimationFrame(updateOffset);

		return () => {
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [scrollProgress, isMobile, deviceTiltX, deviceTiltY, fullConfig.scrollOffsetPxPerUnit, fullConfig.scrollOffsetReference, fullConfig.scrollOffsetSmoothing, fullConfig.deviceTiltOffsetPx]);

	return currentScrollOffsetRef;
}
