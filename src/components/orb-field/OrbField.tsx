"use client";

// =============================================================================
// OrbField - Controller Component for Grid and Orb Systems
// =============================================================================

import { useEffect, useState, useRef, useMemo } from 'react';
import { useOrbManager } from './orb/hooks/useOrbManager';
import {
	DEFAULT_REVEAL_CONFIG,
	DEFAULT_STYLE_CONFIG,
	DEFAULT_ORBFIELD_CONFIG,
	type GridRevealConfig,
	type GridStyleConfig,
} from './shared/config';
import { DEFAULT_CONTINUOUS_SPAWN_CONFIG } from './orb/config';
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
	useCanvasSync,
	useOpacityFade,
	useOpacityRef,
	useOrbBurst,
	useRenderLoop,
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
 * - Initializes hooks
 * - Composes JSX
 * - No business logic (delegated to hooks)
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
	// Refs
	// =========================================================================
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const visualCanvasRef = useRef<HTMLCanvasElement>(null);
	const currentLayerRef = useRef(initialLayer);

	// =========================================================================
	// State
	// =========================================================================
	const [currentLayer, setCurrentLayer] = useState(initialLayer);
	const [orbSize, setOrbSize] = useState(1);

	// =========================================================================
	// Hooks
	// =========================================================================
	const { windowSize, mousePosRef, isPageVisibleRef, isMounted } = useEventHandlers();
	const { gridConfig, viewportCells, gridRef, viewportCellsRef } = useGridInitialization({ windowSize, isMobile });
	const debugState = useDebugStateSync();
	const currentScrollOffsetRef = useParallaxOffset(scrollProgress, isMobile, deviceTiltX, deviceTiltY);

	const orbManager = useOrbManager();
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
		isDebugMode: debugState.isDebugMode,
		currentScrollOffsetRef,
		enableSpawnOnClickRef: debugState.enableSpawnOnClickRef,
		createOrb: orbManager.createOrb,
		deleteOrb: orbManager.deleteOrb,
	});

	const { burstTimeRef } = useOrbBurst({
		triggerBurst,
		spawnOrbBurst: orbManager.spawnOrbBurst,
		windowSize,
		currentScrollOffsetRef,
		gridRef,
		viewportCellsRef,
	});

	const { syncCanvasDimensions } = useCanvasSync();
	const { calculateOpacity, updateOpacity } = useOpacityFade();
	const opacityRef = useOpacityRef(opacity);

	const { runPhysics } = usePhysicsLoop({
		getEffectiveTime: debugState.getEffectiveTime,
		spawnRandomOrbs: orbManager.spawnRandomOrbs,
		syncOrbsState: orbManager.syncOrbsState,
	});

	// =========================================================================
	// Configs
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

	useEffect(() => { currentLayerRef.current = currentLayer; }, [currentLayer]);

	// =========================================================================
	// Render Loop
	// =========================================================================
	const { runLoop } = useRenderLoop(
		{
			runPhysics,
			syncCanvasDimensions,
			calculateOpacity,
			updateOpacity,
			getEffectiveTime: debugState.getEffectiveTime,
			updateSelectedOrbData: orbManager.updateSelectedOrbData,
			revealConfig,
			styleConfig,
		},
		canvasRef,
		visualCanvasRef,
		gridRef,
		viewportCellsRef,
		hoveredCellRef,
		windowSize,
		orbManager.orbsRef,
		orbManager.selectedOrbIdRef,
		currentLayerRef,
		currentScrollOffsetRef,
		mousePosRef,
		isPageVisibleRef,
		burstTimeRef,
		debugState.showGridRef,
		debugState.showCollisionAreaRef,
		debugState.showAvoidanceAreaRef,
		debugState.showGraphicsRef,
		debugState.showArrowVectorRef,
		debugState.showTruePositionRef,
		debugState.pausePhysicsRef,
		debugState.disableCollisionsRef,
		debugState.disableAvoidanceRef,
		debugState.enableOrbSpawningRef,
		debugState.enableOrbDespawningRef,
		debugState.enableSpawnOnClickRef,
		debugState.isDebugModeRef,
		debugState.isDebugMode,
		opacityRef
	);

	useAnimationLoop({
		visible,
		gridConfig,
		revealDuration: revealConfig.duration,
		onLoop: runLoop,
		onAnimationComplete,
	});

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
					pointerEvents: debugState.isDebugMode ? 'auto' : 'none',
					opacity,
				}}
			/>

			<GlassDebugMenu
				orbs={orbManager.orbs}
				targetOrbCount={targetOrbCount}
				selectedOrbId={orbManager.selectedOrbId}
				selectedOrb={orbManager.selectedOrbData}
				orbSize={orbSize}
				onSelectOrb={orbManager.selectOrb}
				onDeleteOrb={handleDeleteOrb}
				onSizeChange={setOrbSize}
				gridConfig={gridConfig}
				viewportCells={viewportCells}
				currentLayer={currentLayer}
				onLayerChange={setCurrentLayer}
				hoveredCell={hoveredCell}
			/>

			{debugState.isDebugMode && gridConfig && viewportCells && !isMobile && (
				<div className={styles.debugPanelContainer}>
					<OrbDebugPanel
						orbs={orbManager.orbs}
						targetOrbCount={targetOrbCount}
						selectedOrbId={orbManager.selectedOrbId}
						selectedOrb={orbManager.selectedOrbData}
						orbSize={orbSize}
						onSelectOrb={orbManager.selectOrb}
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
