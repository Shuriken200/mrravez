"use client";

// =============================================================================
// useAnimationLoop - Hook for managing animation and physics loop
// =============================================================================

import { useEffect, useRef } from 'react';
import { GridAnimator } from '../grid/visuals/GridAnimator';
import { type GridConfig } from '../grid/types';

/**
 * Callback type for the loop update function.
 * @param easedProgress - Animation progress (0 to 1) with easing applied.
 * @param deltaTime - Time elapsed since last frame in seconds.
 */
export type LoopCallback = (easedProgress: number, deltaTime: number) => void;

/**
 * Options for the animation loop hook.
 */
interface UseAnimationLoopOptions {
	/** Whether the animation should be visible/active. */
	visible: boolean;
	/** Grid configuration (animation starts when grid is ready). */
	gridConfig: GridConfig | null;
	/** Duration of the reveal animation in milliseconds. */
	revealDuration: number;
	/** Callback fired each frame during animation and physics loop. */
	onLoop: LoopCallback;
	/** Callback fired when reveal animation completes. */
	onAnimationComplete?: () => void;
}

/**
 * Manages the animation loop lifecycle.
 * 
 * Handles:
 * - Reveal animation with GridAnimator
 * - Transition to continuous physics loop
 * - Frame timing and deltaTime calculation
 * - Cleanup on unmount
 * 
 * Note: This hook doesn't return state values as they would cause unnecessary re-renders.
 * The animation loop runs independently via refs for optimal performance.
 * 
 * @param options - Configuration options for the animation loop.
 */
export function useAnimationLoop({
	visible,
	gridConfig,
	revealDuration,
	onLoop,
	onAnimationComplete,
}: UseAnimationLoopOptions): void {
	const animatorRef = useRef<GridAnimator | null>(null);
	const loopIdRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const hasAnimatedRef = useRef(false);

	// Stable callback wrapper
	const onLoopRef = useRef(onLoop);
	useEffect(() => {
		onLoopRef.current = onLoop;
	}, [onLoop]);

	useEffect(() => {
		if (!visible || !gridConfig) return;

		animatorRef.current = new GridAnimator(
			revealDuration,
			(progress, eased) => {
				const now = performance.now();
				const dt = lastFrameTimeRef.current ? (now - lastFrameTimeRef.current) / 1000 : 0;
				lastFrameTimeRef.current = now;

				onLoopRef.current(eased, dt);
			},
			() => {
				hasAnimatedRef.current = true;

				// Notify parent that grid animation is complete
				onAnimationComplete?.();

				// Continue with physics loop after reveal
				const physicsLoop = () => {
					if (!hasAnimatedRef.current) return;

					const now = performance.now();
					const dt = (now - lastFrameTimeRef.current) / 1000;
					lastFrameTimeRef.current = now;

					onLoopRef.current(1, dt);
					loopIdRef.current = requestAnimationFrame(physicsLoop);
				};
				loopIdRef.current = requestAnimationFrame(physicsLoop);
			}
		);

		animatorRef.current.start();

		return () => {
			animatorRef.current?.stop();
			if (loopIdRef.current) cancelAnimationFrame(loopIdRef.current);
			hasAnimatedRef.current = false;
		};
	}, [visible, gridConfig, revealDuration, onAnimationComplete]);
}
