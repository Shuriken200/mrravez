// =============================================================================
// Spawn Configuration
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
 * Default spawn configuration for orbs.
 */
export const DEFAULT_ORB_SPAWN_CONFIG: OrbSpawnConfig = {
	minSpeed: 50,
	maxSpeed: 150,
	defaultSize: 1,
	minSize: 1,
	maxSize: 20,
};
