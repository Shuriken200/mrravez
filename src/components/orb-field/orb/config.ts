// =============================================================================
// Orb System Configuration
// =============================================================================

/**
 * Configuration for orb spawning behavior.
 */
export interface OrbSpawnConfig {
	/** Minimum speed for newly spawned orbs (pixels/second). */
	minSpeed: number;
	/** Maximum speed for newly spawned orbs (pixels/second). */
	maxSpeed: number;
	/** Default size for newly spawned orbs (grid cells). */
	defaultSize: number;
	/** Minimum allowed orb size. */
	minSize: number;
	/** Maximum allowed orb size. */
	maxSize: number;
}

/**
 * Configuration for orb speed limiting.
 */
export interface OrbSpeedLimitConfig {
	/** Base max speed for size 1 orbs (pixels/second). */
	baseMaxSpeed: number;
	/** How quickly orbs decelerate when over max speed (0-1, higher = faster). */
	decelerationRate: number;
	/** Minimum max speed for the largest orbs (pixels/second). */
	minMaxSpeed: number;
}

/**
 * Configuration for orb debug visualization.
 */
export interface OrbDebugVisualConfig {
	/** Color of the orb position indicator. */
	positionColor: string;
	/** Color of the velocity vector arrow. */
	arrowColor: string;
	/** Opacity of the velocity arrow (0-1). */
	arrowOpacity: number;
	/** Scale factor for velocity vector visualization. */
	arrowScale: number;
	/** Length of the arrowhead in pixels. */
	arrowHeadLength: number;
	/** Line width of the velocity arrow. */
	arrowLineWidth: number;
}

/**
 * Default spawn configuration for orbs.
 */
export const DEFAULT_ORB_SPAWN_CONFIG: OrbSpawnConfig = {
	minSpeed: 50,
	maxSpeed: 150,
	defaultSize: 1,
	minSize: 1,
	maxSize: 10,
};

/**
 * Default speed limit configuration for orbs.
 * Larger orbs have lower max speeds.
 */
export const DEFAULT_SPEED_LIMIT_CONFIG: OrbSpeedLimitConfig = {
	baseMaxSpeed: 200,      // Size 1 orbs can go up to 200 px/s
	decelerationRate: 0.05, // 5% per frame toward max speed (smooth curve)
	minMaxSpeed: 50,        // Even the largest orbs can go at least 50 px/s
};

/**
 * Default debug visualization configuration for orbs.
 */
export const DEFAULT_ORB_DEBUG_CONFIG: OrbDebugVisualConfig = {
	positionColor: '#FFFFFF',
	arrowColor: 'rgba(255, 255, 255, 0.8)',
	arrowOpacity: 0.8,
	arrowScale: 0.5,
	arrowHeadLength: 6,
	arrowLineWidth: 1,
};

