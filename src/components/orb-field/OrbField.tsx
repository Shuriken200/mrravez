"use client";

// =============================================================================
// OrbField - Controller Component for Grid and Orb Systems
// =============================================================================

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useOrbManager } from './orb/hooks/useOrbManager';
import {
	DEFAULT_REVEAL_CONFIG,
	DEFAULT_STYLE_CONFIG,
	DEFAULT_ORBFIELD_CONFIG,
	type GridRevealConfig,
	type GridStyleConfig,
} from './shared/config';
import { DEFAULT_CONTINUOUS_SPAWN_CONFIG } from './orb/config';
import { OrbVisualRenderer } from './orb/visuals/OrbVisualRenderer';
import { GridRenderer } from './grid/visuals/GridRenderer';
import { OrbDebugPanel, GridDebugPanel } from './debug-info';
import { GlassDebugMenu } from '@/components/debug';
import {
	useParallaxOffset,
	useAnimationLoop,
	useDebugStateSync,
	useEventHandlers,
	usePhysicsLoop,
	useGridInitialization,
	useOrbFieldInteractions,
} from './hooks';
import styles from './OrbField.module.css';

/**
 * Props for the OrbField component.
 */
interface OrbFieldProps {
	/** Visibility toggle for the entire system. */
	visible?: boolean;
	/** Initial depth layer for visualization. */
	layer?: number;
	/** Base opacity of the canvas element. */
	opacity?: number;
	/** Overrides for reveal animation configuration. */
	revealConfig?: Partial<GridRevealConfig>;
	/** Overrides for visual style configuration. */
	styleConfig?: Partial<GridStyleConfig>;
	/** When true, triggers the orb burst explosion. Should transition from false to true once. */
	triggerBurst?: boolean;
	/** Callback fired when grid roll animation completes. */
	onAnimationComplete?: () => void;
	/** Current scroll/swipe progress (0.75 to 2.75 range). Used for parallax grid movement. */
	scrollProgress?: number;
	/** Whether device is mobile (affects scroll direction: horizontal vs vertical). */
	isMobile?: boolean;
	/** Device tilt X (0-1, 0.5 = center) for parallax offset */
	deviceTiltX?: number;
	/** Device tilt Y (0-1, 0.5 = center) for parallax offset */
	deviceTiltY?: number;
}

/**
 * Main controller component for the Orb Field visualization system.
 *
 * Responsibilities:
 * - Orchestrates grid initialization and resize handling
 * - Manages animation and physics loop
 * - Delegates orb management to useOrbManager hook
 * - Delegates rendering to GridRenderer
 *
 * @param props - Component configuration props.
 */
export function OrbField({
	visible = true,
	layer: initialLayer = 50,
	opacity = DEFAULT_ORBFIELD_CONFIG.defaultOpacity,
	revealConfig: revealOverrides,
	styleConfig: styleOverrides,
	triggerBurst = false,
	onAnimationComplete,
	scrollProgress = 0.75,
	isMobile = false,
	deviceTiltX = 0.5,
	deviceTiltY = 0.5,
}: OrbFieldProps) {
	// =========================================================================
	// Refs for High-Performance Loop
	// =========================================================================
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const visualCanvasRef = useRef<HTMLCanvasElement>(null);
	const currentLayerRef = useRef(initialLayer);
	const burstTimeRef = useRef<number | null>(null);
	const hasBurstRef = useRef(false);

	// =========================================================================
	// React State for UI
	// =========================================================================
	const [currentLayer, setCurrentLayer] = useState(initialLayer);
	const [orbSize, setOrbSize] = useState(1);

	// =========================================================================
	// Custom Hooks
	// =========================================================================
	const { windowSize, mousePosRef, isPageVisibleRef, isMounted } = useEventHandlers();

	const {
		gridConfig,
		viewportCells,
		gridRef,
		viewportCellsRef,
	} = useGridInitialization({ windowSize, isMobile });

	const {
		showGridRef,
		showCollisionAreaRef,
		showAvoidanceAreaRef,
		showGraphicsRef,
		enableOrbSpawningRef,
		enableOrbDespawningRef,
		enableSpawnOnClickRef,
		pausePhysicsRef,
		disableCollisionsRef,
		disableAvoidanceRef,
		showArrowVectorRef,
		showTruePositionRef,
		isDebugModeRef,
		isDebugMode,
		getEffectiveTime,
	} = useDebugStateSync();

	const currentScrollOffsetRef = useParallaxOffset(scrollProgress, isMobile, deviceTiltX, deviceTiltY);

	const {
		orbsRef,
		orbs,
		selectedOrbId,
		selectedOrbData,
		selectedOrbIdRef,
		createOrb,
		spawnOrbBurst,
		spawnRandomOrbs,
		deleteOrb,
		selectOrb,
		updateSelectedOrbData,
		syncOrbsState,
	} = useOrbManager();

	const {
		hoveredCell,
		hoveredCellRef,
		handleMouseMove,
		handleClick,
		handleMouseLeave,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleDeleteOrb,
	} = useOrbFieldInteractions({
		gridConfig,
		viewportCellsRef,
		gridRef,
		currentLayerRef,
		orbSize,
		isDebugMode,
		currentScrollOffsetRef,
		enableSpawnOnClickRef,
		createOrb,
		deleteOrb,
	});

	// =========================================================================
	// Memoized Configs
	// =========================================================================
	const revealConfig = useMemo(
		() => ({ ...DEFAULT_REVEAL_CONFIG, ...revealOverrides }),
		[revealOverrides]
	);
	const styleConfig = useMemo(
		() => ({ ...DEFAULT_STYLE_CONFIG, ...styleOverrides }),
		[styleOverrides]
	);

	const targetOrbCount = useMemo(() => {
		const { targetOrbCountAt4K, referenceScreenArea, minOrbCount } = DEFAULT_CONTINUOUS_SPAWN_CONFIG;
		const screenArea = windowSize.width * windowSize.height;
		const areaScale = screenArea / referenceScreenArea;
		const scaledCount = Math.round(targetOrbCountAt4K * areaScale);
		return Math.max(minOrbCount, scaledCount);
	}, [windowSize]);

	const opacityRef = useRef(opacity);
	useEffect(() => { opacityRef.current = opacity; }, [opacity]);
	useEffect(() => { currentLayerRef.current = currentLayer; }, [currentLayer]);

	// =========================================================================
	// Physics Loop
	// =========================================================================
	const { runPhysics } = usePhysicsLoop({
		getEffectiveTime,
		spawnRandomOrbs,
		syncOrbsState,
	});

	// =========================================================================
	// Rendering Loop
	// =========================================================================
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
		runPhysics(
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
			enableOrbDespawningRef
		);

		// Canvas Size Sync
		if (canvas.width !== windowSize.width || canvas.height !== windowSize.height) {
			canvas.width = windowSize.width;
			canvas.height = windowSize.height;
		}
		if (visualCanvas && (visualCanvas.width !== windowSize.width || visualCanvas.height !== windowSize.height)) {
			visualCanvas.width = windowSize.width;
			visualCanvas.height = windowSize.height;
		}

		// Opacity Fade Logic
		let finalOpacity = opacityRef.current;
		if (!isDebugModeRef.current) {
			const fadeStart = DEFAULT_ORBFIELD_CONFIG.fadeOutStart;
			if (easedProgress > fadeStart) {
				const fadeFactor = (easedProgress - fadeStart) / (1 - fadeStart);
				finalOpacity *= (1 - fadeFactor);
			}
		} else {
			finalOpacity = 1;
		}
		canvas.style.opacity = finalOpacity.toString();

		// Render Debug Frame
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

		// Render Visual Orbs
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

		// Debug Panel Sync
		if (isDebugMode && selectedOrbIdRef.current) {
			updateSelectedOrbData();
		}
	}, [windowSize, orbsRef, selectedOrbIdRef, updateSelectedOrbData, getEffectiveTime, revealConfig, styleConfig, isDebugMode, currentScrollOffsetRef, showGridRef, showCollisionAreaRef, showAvoidanceAreaRef, showGraphicsRef, showArrowVectorRef, showTruePositionRef, isDebugModeRef, runPhysics, mousePosRef, isPageVisibleRef, burstTimeRef, pausePhysicsRef, disableCollisionsRef, disableAvoidanceRef, enableOrbSpawningRef, enableOrbDespawningRef, enableSpawnOnClickRef, gridRef, viewportCellsRef, hoveredCellRef]);

	// Animation Loop
	useAnimationLoop({
		visible,
		gridConfig,
		revealDuration: revealConfig.duration,
		onLoop: runLoop,
		onAnimationComplete,
	});

	// =========================================================================
	// Orb Burst Trigger
	// =========================================================================
	useEffect(() => {
		if (!triggerBurst || hasBurstRef.current) return;

		const checkAndBurst = () => {
			if (hasBurstRef.current) return;

			const grid = gridRef.current;
			const vpc = viewportCellsRef.current;

			if (grid && vpc && windowSize.width > 0) {
				hasBurstRef.current = true;
				const centerX = (windowSize.width / 2) - currentScrollOffsetRef.current.x;
				const centerY = (windowSize.height / 2) - currentScrollOffsetRef.current.y;
				spawnOrbBurst(centerX, centerY, grid, vpc);
				burstTimeRef.current = performance.now();
			} else {
				requestAnimationFrame(checkAndBurst);
			}
		};

		checkAndBurst();
	}, [triggerBurst, spawnOrbBurst, windowSize, currentScrollOffsetRef, gridRef, viewportCellsRef]);

	// =========================================================================
	// Render
	// =========================================================================
	if (!visible || !isMounted) return null;

	return (
		<>
			<canvas ref={visualCanvasRef} className={styles.visualCanvas} />
			<canvas
				ref={canvasRef}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={handleTouchEnd}
				className={styles.debugCanvas}
				style={{
					pointerEvents: isDebugMode ? 'auto' : 'none',
					opacity,
				}}
			/>

			<GlassDebugMenu
				orbs={orbs}
				targetOrbCount={targetOrbCount}
				selectedOrbId={selectedOrbId}
				selectedOrb={selectedOrbData}
				orbSize={orbSize}
				onSelectOrb={selectOrb}
				onDeleteOrb={handleDeleteOrb}
				onSizeChange={setOrbSize}
				gridConfig={gridConfig}
				viewportCells={viewportCells}
				currentLayer={currentLayer}
				onLayerChange={setCurrentLayer}
				hoveredCell={hoveredCell}
			/>

			{isDebugMode && gridConfig && viewportCells && !isMobile && (
				<div className={styles.debugPanelContainer}>
					<OrbDebugPanel
						orbs={orbs}
						targetOrbCount={targetOrbCount}
						selectedOrbId={selectedOrbId}
						selectedOrb={selectedOrbData}
						orbSize={orbSize}
						onSelectOrb={selectOrb}
						onDeleteOrb={handleDeleteOrb}
						onSizeChange={setOrbSize}
					/>
					<GridDebugPanel
						gridConfig={gridConfig}
						viewportCells={viewportCells}
						currentLayer={currentLayer}
						onLayerChange={setCurrentLayer}
						hoveredCell={hoveredCell}
					/>
				</div>
			)}
		</>
	);
}

export default OrbField;
