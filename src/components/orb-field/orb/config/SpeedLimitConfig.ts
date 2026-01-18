// =============================================================================
// Speed Limit Configuration
// =============================================================================

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
 * Default speed limit configuration for orbs.
 * Larger orbs have lower max speeds.
 */
export const DEFAULT_SPEED_LIMIT_CONFIG: OrbSpeedLimitConfig = {
	baseMaxSpeed: 200,      // Size 1 orbs can go up to 200 px/s
	decelerationRate: 0.05, // 5% per frame toward max speed (smooth curve)
	minMaxSpeed: 50,        // Even the largest orbs can go at least 50 px/s
};
