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
 * Parameters for render loop hook.
 */
interface UseRenderLoopParams {
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
	/** Grid reveal configuration. */
	revealConfig: GridRevealConfig;
	/** Grid style configuration. */
	styleConfig: GridStyleConfig;
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
 * Single Responsibility: Rendering orchestration only.
 */
export function useRenderLoop(
	params: UseRenderLoopParams,
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	visualCanvasRef: React.RefObject<HTMLCanvasElement | null>,
	gridRef: React.RefObject<SpatialGrid | null>,
	viewportCellsRef: React.RefObject<ViewportCells | null>,
	hoveredCellRef: React.RefObject<{ x: number; y: number; worldX: number; worldY: number } | null>,
	windowSize: WindowSize,
	orbsRef: React.RefObject<Orb[]>,
	selectedOrbIdRef: React.RefObject<string | null>,
	currentLayerRef: React.RefObject<number>,
	currentScrollOffsetRef: React.RefObject<{ x: number; y: number }>,
	mousePosRef: React.RefObject<{ x: number; y: number } | null>,
	isPageVisibleRef: React.RefObject<boolean>,
	burstTimeRef: React.RefObject<number | null>,
	showGridRef: React.RefObject<boolean>,
	showCollisionAreaRef: React.RefObject<boolean>,
	showAvoidanceAreaRef: React.RefObject<boolean>,
	showGraphicsRef: React.RefObject<boolean>,
	showArrowVectorRef: React.RefObject<boolean>,
	showTruePositionRef: React.RefObject<boolean>,
	pausePhysicsRef: React.RefObject<boolean>,
	disableCollisionsRef: React.RefObject<boolean>,
	disableAvoidanceRef: React.RefObject<boolean>,
	enableOrbSpawningRef: React.RefObject<boolean>,
	enableOrbDespawningRef: React.RefObject<boolean>,
	enableSpawnOnClickRef: React.RefObject<boolean>,
	isDebugModeRef: React.RefObject<boolean>,
	isDebugMode: boolean,
	opacityRef: React.RefObject<number>
): UseRenderLoopReturn {
	const {
		runPhysics,
		syncCanvasDimensions,
		calculateOpacity,
		updateOpacity,
		getEffectiveTime,
		updateSelectedOrbData,
		revealConfig,
		styleConfig,
	} = params;

	const runLoop = useCallback((easedProgress: number, deltaTime: number) => {
		const canvas = canvasRef.current;
		const visualCanvas = visualCanvasRef.current;
		const grid = gridRef.current;
		const vpc = viewportCellsRef.current;
		const hoveredCell = hoveredCellRef.current;

		if (!canvas || !grid || !vpc || windowSize.width === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

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
		GridRenderer.draw(
			ctx,
			windowSize,
			vpc,
			easedProgress,
			revealConfig,
			styleConfig,
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
		runPhysics,
		syncCanvasDimensions,
		calculateOpacity,
		updateOpacity,
		getEffectiveTime,
		updateSelectedOrbData,
		revealConfig,
		styleConfig,
		canvasRef,
		visualCanvasRef,
		gridRef,
		viewportCellsRef,
		hoveredCellRef,
		windowSize,
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
		isDebugMode,
		opacityRef,
	]);

	return {
		runLoop,
	};
}
