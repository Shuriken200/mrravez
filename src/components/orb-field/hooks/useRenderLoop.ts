"use client";

// =============================================================================
// useRenderLoop - Orchestrates rendering operations
// =============================================================================

import { useCallback } from 'react';
import { type PhysicsContext } from './types';
import { type WindowSize } from '../shared/types';
import { type GridRevealConfig, type GridStyleConfig } from '../shared/config';
import { GridRenderer } from '../grid/visuals/GridRenderer';
import { OrbVisualRenderer } from '../orb/visuals/OrbVisualRenderer';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';

/**
 * Refs for render loop - all values accessed via refs for stable callback.
 */
interface UseRenderLoopRefs {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	visualCanvasRef: React.RefObject<HTMLCanvasElement | null>;
	gridRef: React.RefObject<SpatialGrid | null>;
	viewportCellsRef: React.RefObject<ViewportCells | null>;
	hoveredCellRef: React.RefObject<{ x: number; y: number; worldX: number; worldY: number } | null>;
	windowSizeRef: React.RefObject<WindowSize>;
	orbsRef: React.RefObject<Orb[]>;
	selectedOrbIdRef: React.RefObject<string | null>;
	currentLayerRef: React.RefObject<number>;
	currentScrollOffsetRef: React.RefObject<{ x: number; y: number }>;
	mousePosRef: React.RefObject<{ x: number; y: number } | null>;
	isPageVisibleRef: React.RefObject<boolean>;
	burstTimeRef: React.RefObject<number | null>;
	showGridRef: React.RefObject<boolean>;
	showCollisionAreaRef: React.RefObject<boolean>;
	showAvoidanceAreaRef: React.RefObject<boolean>;
	showGraphicsRef: React.RefObject<boolean>;
	showArrowVectorRef: React.RefObject<boolean>;
	showTruePositionRef: React.RefObject<boolean>;
	pausePhysicsRef: React.RefObject<boolean>;
	disableCollisionsRef: React.RefObject<boolean>;
	disableAvoidanceRef: React.RefObject<boolean>;
	enableOrbSpawningRef: React.RefObject<boolean>;
	enableOrbDespawningRef: React.RefObject<boolean>;
	enableSpawnOnClickRef: React.RefObject<boolean>;
	isDebugModeRef: React.RefObject<boolean>;
	opacityRef: React.RefObject<number>;
	revealConfigRef: React.RefObject<GridRevealConfig>;
	styleConfigRef: React.RefObject<GridStyleConfig>;
}

/**
 * Callbacks for render loop - must be stable (wrapped in useCallback).
 */
interface UseRenderLoopCallbacks {
	/** Function to run physics simulation. */
	runPhysics: (context: PhysicsContext) => void;
	/** Function to sync canvas dimensions. */
	syncCanvasDimensions: (canvas: HTMLCanvasElement | null, visualCanvas: HTMLCanvasElement | null, windowSize: WindowSize) => void;
	/** Function to calculate opacity. */
	calculateOpacity: (params: { baseOpacity: number; easedProgress: number; isDebugMode: boolean }) => number;
	/** Function to update canvas opacity. */
	updateOpacity: (canvas: HTMLCanvasElement | null, opacity: number) => void;
	/** Function to get effective time. */
	getEffectiveTime: () => number;
	/** Function to update selected orb data. */
	updateSelectedOrbData: () => void;
	/** Function to update parallax offset. */
	updateParallaxOffset: () => void;
}

/**
 * Return values from render loop hook.
 */
export interface UseRenderLoopReturn {
	/** Callback for each frame of the render loop. */
	runLoop: (easedProgress: number, deltaTime: number) => void;
}

/**
 * Orchestrates all rendering operations per frame.
 * 
 * Uses refs for all values to minimize dependency array and prevent
 * callback recreation. Only stable callbacks are in dependencies.
 * 
 * Single Responsibility: Rendering orchestration only.
 */
export function useRenderLoop(
	refs: UseRenderLoopRefs,
	callbacks: UseRenderLoopCallbacks
): UseRenderLoopReturn {
	const {
		canvasRef,
		visualCanvasRef,
		gridRef,
		viewportCellsRef,
		hoveredCellRef,
		windowSizeRef,
		orbsRef,
		selectedOrbIdRef,
		currentLayerRef,
		currentScrollOffsetRef,
		mousePosRef,
		isPageVisibleRef,
		burstTimeRef,
		showGridRef,
		showCollisionAreaRef,
		showAvoidanceAreaRef,
		showGraphicsRef,
		showArrowVectorRef,
		showTruePositionRef,
		pausePhysicsRef,
		disableCollisionsRef,
		disableAvoidanceRef,
		enableOrbSpawningRef,
		enableOrbDespawningRef,
		enableSpawnOnClickRef,
		isDebugModeRef,
		opacityRef,
		revealConfigRef,
		styleConfigRef,
	} = refs;

	const {
		runPhysics,
		syncCanvasDimensions,
		calculateOpacity,
		updateOpacity,
		getEffectiveTime,
		updateSelectedOrbData,
		updateParallaxOffset,
	} = callbacks;

	const runLoop = useCallback((easedProgress: number, deltaTime: number) => {
		const canvas = canvasRef.current;
		const visualCanvas = visualCanvasRef.current;
		const grid = gridRef.current;
		const vpc = viewportCellsRef.current;
		const hoveredCell = hoveredCellRef.current;
		const windowSize = windowSizeRef.current;

		if (!canvas || !grid || !vpc || windowSize.width === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Update parallax offset (was separate RAF loop, now inline)
		updateParallaxOffset();

		// Run physics simulation
		runPhysics({
			easedProgress,
			deltaTime,
			orbsRef,
			grid,
			vpc,
			windowSize,
			mousePosRef,
			isPageVisibleRef,
			burstTimeRef,
			pausePhysicsRef,
			disableCollisionsRef,
			disableAvoidanceRef,
			enableOrbSpawningRef,
			enableOrbDespawningRef,
		});

		// Sync canvas dimensions
		syncCanvasDimensions(canvas, visualCanvas, windowSize);

		// Calculate and apply opacity
		const opacity = calculateOpacity({
			baseOpacity: opacityRef.current,
			easedProgress,
			isDebugMode: isDebugModeRef.current,
		});
		updateOpacity(canvas, opacity);

		// Render debug grid
		const isDebugMode = isDebugModeRef.current;
		GridRenderer.draw(
			ctx,
			windowSize,
			vpc,
			easedProgress,
			revealConfigRef.current,
			styleConfigRef.current,
			isDebugMode && enableSpawnOnClickRef.current ? hoveredCell : null,
			grid,
			currentLayerRef.current,
			isDebugMode ? orbsRef.current : [],
			undefined,
			currentScrollOffsetRef.current.x,
			currentScrollOffsetRef.current.y,
			showGridRef.current,
			showCollisionAreaRef.current,
			showAvoidanceAreaRef.current,
			showArrowVectorRef.current,
			showTruePositionRef.current
		);

		// Render visual orbs
		if (visualCanvas && easedProgress >= 1) {
			const visualCtx = visualCanvas.getContext('2d');
			if (visualCtx) {
				if (showGraphicsRef.current) {
					const now = getEffectiveTime();
					OrbVisualRenderer.draw(
						visualCtx,
						windowSize,
						orbsRef.current,
						grid.config.layers,
						undefined,
						now,
						currentScrollOffsetRef.current.x,
						currentScrollOffsetRef.current.y
					);
				} else {
					visualCtx.clearRect(0, 0, windowSize.width, windowSize.height);
				}
			}
		}

		// Sync debug panel
		if (isDebugMode && selectedOrbIdRef.current) {
			updateSelectedOrbData();
		}
	}, [
		// Only stable callbacks in dependencies - refs are read inside callback
		runPhysics,
		syncCanvasDimensions,
		calculateOpacity,
		updateOpacity,
		getEffectiveTime,
		updateSelectedOrbData,
		updateParallaxOffset,
		// Refs are stable and don't need to be in dependencies, but including them
		// doesn't hurt and satisfies exhaustive-deps lint rule
		canvasRef,
		visualCanvasRef,
		gridRef,
		viewportCellsRef,
		hoveredCellRef,
		windowSizeRef,
		orbsRef,
		selectedOrbIdRef,
		currentLayerRef,
		currentScrollOffsetRef,
		mousePosRef,
		isPageVisibleRef,
		burstTimeRef,
		showGridRef,
		showCollisionAreaRef,
		showAvoidanceAreaRef,
		showGraphicsRef,
		showArrowVectorRef,
		showTruePositionRef,
		pausePhysicsRef,
		disableCollisionsRef,
		disableAvoidanceRef,
		enableOrbSpawningRef,
		enableOrbDespawningRef,
		enableSpawnOnClickRef,
		isDebugModeRef,
		opacityRef,
		revealConfigRef,
		styleConfigRef,
	]);

	// Log when runLoop is recreated
	console.log('[useRenderLoop] runLoop created');

	return {
		runLoop,
	};
}
