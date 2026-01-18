"use client";

// =============================================================================
// useOrbBurst - Orb burst trigger logic
// =============================================================================

import { useEffect, useRef } from 'react';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type WindowSize } from '../shared/types';

/**
 * Parameters for orb burst hook.
 */
interface UseOrbBurstParams {
	/** When true, triggers the orb burst explosion. */
	triggerBurst: boolean;
	/** Function to spawn burst of orbs. */
	spawnOrbBurst: (centerX: number, centerY: number, grid: SpatialGrid, vpc: ViewportCells) => void;
	/** Current window dimensions. */
	windowSize: WindowSize;
	/** Ref to current scroll offset. */
	currentScrollOffsetRef: React.RefObject<{ x: number; y: number }>;
	/** Ref to spatial grid. */
	gridRef: React.RefObject<SpatialGrid | null>;
	/** Ref to viewport cells. */
	viewportCellsRef: React.RefObject<ViewportCells | null>;
}

/**
 * Return values from orb burst hook.
 */
export interface UseOrbBurstReturn {
	/** Ref to time when burst occurred (or null). */
	burstTimeRef: React.RefObject<number | null>;
}

/**
 * Handles orb burst triggering with retry logic.
 * 
 * Single Responsibility: Burst trigger management only.
 */
export function useOrbBurst(params: UseOrbBurstParams): UseOrbBurstReturn {
	const {
		triggerBurst,
		spawnOrbBurst,
		windowSize,
		currentScrollOffsetRef,
		gridRef,
		viewportCellsRef,
	} = params;

	const burstTimeRef = useRef<number | null>(null);
	const hasBurstRef = useRef(false);

	useEffect(() => {
		if (!triggerBurst || hasBurstRef.current) return;

		const checkAndBurst = () => {
			if (hasBurstRef.current) return;

			const grid = gridRef.current;
			const vpc = viewportCellsRef.current;

			if (grid && vpc && windowSize.width > 0) {
				hasBurstRef.current = true;
				const centerX = (windowSize.width / 2) - currentScrollOffsetRef.current!.x;
				const centerY = (windowSize.height / 2) - currentScrollOffsetRef.current!.y;
				spawnOrbBurst(centerX, centerY, grid, vpc);
				burstTimeRef.current = performance.now();
			} else {
				requestAnimationFrame(checkAndBurst);
			}
		};

		checkAndBurst();
	}, [triggerBurst, spawnOrbBurst, windowSize, currentScrollOffsetRef, gridRef, viewportCellsRef]);

	return {
		burstTimeRef,
	};
}
