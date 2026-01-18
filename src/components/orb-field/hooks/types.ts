// =============================================================================
// Hook Types - Shared type definitions for orb-field hooks
// =============================================================================

import { type Orb } from '../orb/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type WindowSize } from '../shared/types';

/**
 * Context object for physics simulation.
 * Consolidates all physics-related parameters into a single object.
 */
export interface PhysicsContext {
	/** Animation progress (0 to 1) with easing applied. */
	easedProgress: number;
	/** Time elapsed since last frame in seconds. */
	deltaTime: number;
	/** Ref to orbs array for high-performance loop access. */
	orbsRef: React.RefObject<Orb[]>;
	/** Spatial grid for collision detection. */
	grid: SpatialGrid;
	/** Viewport cells for coordinate conversion. */
	vpc: ViewportCells;
	/** Current window dimensions. */
	windowSize: WindowSize;
	/** Ref to mouse position (or null if not over canvas). */
	mousePosRef: React.RefObject<{ x: number; y: number } | null>;
	/** Ref indicating if page is visible and focused. */
	isPageVisibleRef: React.RefObject<boolean>;
	/** Ref to time when burst occurred (or null). */
	burstTimeRef: React.RefObject<number | null>;
	/** Ref for pause physics setting. */
	pausePhysicsRef: React.RefObject<boolean>;
	/** Ref for disable collisions setting. */
	disableCollisionsRef: React.RefObject<boolean>;
	/** Ref for disable avoidance setting. */
	disableAvoidanceRef: React.RefObject<boolean>;
	/** Ref for enable orb spawning setting. */
	enableOrbSpawningRef: React.RefObject<boolean>;
	/** Ref for enable orb despawning setting. */
	enableOrbDespawningRef: React.RefObject<boolean>;
}

/**
 * Context object for rendering operations.
 * Consolidates all rendering-related parameters into a single object.
 */
export interface RenderContext {
	/** 2D canvas rendering context for debug grid. */
	ctx: CanvasRenderingContext2D;
	/** 2D canvas rendering context for visual orbs (optional). */
	visualCtx: CanvasRenderingContext2D | null;
	/** Current window dimensions. */
	windowSize: WindowSize;
	/** Viewport cells for coordinate conversion. */
	vpc: ViewportCells;
	/** Animation progress (0 to 1) with easing applied. */
	easedProgress: number;
	/** Currently hovered cell coordinates, or null. */
	hoveredCell: { x: number; y: number; worldX: number; worldY: number } | null;
	/** Spatial grid for cell state queries. */
	grid: SpatialGrid;
	/** Currently visible depth layer. */
	currentLayer: number;
	/** Array of orbs for debug visualization. */
	orbs: Orb[];
	/** Horizontal offset in pixels for parallax scrolling. */
	offsetX: number;
	/** Vertical offset in pixels for parallax scrolling. */
	offsetY: number;
	/** Whether to show grid lines. */
	showGrid: boolean;
	/** Whether to show collision area cells. */
	showCollisionArea: boolean;
	/** Whether to show avoidance area cells. */
	showAvoidanceArea: boolean;
	/** Whether to show graphics (visual orbs). */
	showGraphics: boolean;
	/** Whether to show velocity arrow vectors. */
	showArrowVector: boolean;
	/** Whether to show true position indicator dot. */
	showTruePosition: boolean;
	/** Whether debug mode is enabled. */
	isDebugMode: boolean;
}
