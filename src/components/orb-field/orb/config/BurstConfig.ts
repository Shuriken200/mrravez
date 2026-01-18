// =============================================================================
// Burst Spawn Configuration
// =============================================================================

/**
 * Configuration for orb burst spawning behavior.
 */
export interface OrbBurstConfig {
	/** Target number of orbs to spawn in burst. */
	targetCount: number;
	/** Maximum allowed orb size for burst. */
	maxSize: number;
	/** Spawn zone radius from center point in pixels. */
	spawnRadiusPx: number;
	/** Maximum retry attempts per orb for collision-safe placement. */
	maxRetries: number;
	/** Base minimum speed for size 1 orbs (pixels/second). */
	minSpeed: number;
	/** Base maximum speed for size 1 orbs (pixels/second). */
	maxSpeed: number;
	/** Minimum lifetime for orbs in milliseconds. */
	minLifetimeMs: number;
	/** Maximum lifetime for orbs in milliseconds. */
	maxLifetimeMs: number;
	/** Maximum spawn delay for staggered appearance (milliseconds). */
	spawnDelayMaxMs: number;
	/** Random position offset added to spawn positions for organic look (pixels). */
	positionJitterPx: number;
}

/**
 * Default burst spawn configuration for orbs.
 * Spawns 75-100 orbs from center with size-based distribution and velocity.
 */
export const DEFAULT_ORB_BURST_CONFIG: OrbBurstConfig = {
	targetCount: 87,       // Target number of orbs (75-100 range)
	maxSize: 8,            // Cap at size 8
	spawnRadiusPx: 30,     // Spawn within 30px radius from center (very tight explosion)
	maxRetries: 20,        // Try up to 20 positions per orb
	minSpeed: 400,         // Base min speed for size 1 orbs (wide range for variance)
	maxSpeed: 1400,        // Base max speed for size 1 orbs (high speeds for dramatic effect)
	minLifetimeMs: 10000,  // Minimum lifetime: 10 seconds
	maxLifetimeMs: 180000, // Maximum lifetime: 3 minutes
	spawnDelayMaxMs: 100,  // Stagger orb appearances over 100ms (tighter burst)
	positionJitterPx: 15,  // Add ±15px random offset to positions
};
