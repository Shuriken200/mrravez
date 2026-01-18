// =============================================================================
// Wander Configuration
// =============================================================================

/**
 * Configuration for orb wander behavior (organic velocity drift).
 */
export interface OrbWanderConfig {
	/** Minimum wander strength (radians/second). */
	minWanderStrength: number;
	/** Maximum wander strength (radians/second). */
	maxWanderStrength: number;
	/** Minimum wander speed - how fast direction changes (radians/second). */
	minWanderSpeed: number;
	/** Maximum wander speed (radians/second). */
	maxWanderSpeed: number;
	/** Minimum modulation speed for intensity variation. */
	minModulationSpeed: number;
	/** Maximum modulation speed. */
	maxModulationSpeed: number;
}

/**
 * Default wander configuration for orbs.
 * Creates organic, drifting motion by slowly changing velocity direction.
 * Values are intentionally subtle for gentle, gradual curves.
 */
export const DEFAULT_WANDER_CONFIG: OrbWanderConfig = {
	minWanderStrength: 0.02,   // Minimum turn rate (radians/second) - very subtle
	maxWanderStrength: 0.08,   // Maximum turn rate (radians/second) - gentle curves
	minWanderSpeed: 0.05,      // Slowest wander cycle (radians/second for phase)
	maxWanderSpeed: 0.15,      // Fastest wander cycle - still quite slow
	minModulationSpeed: 0.01,  // Slowest intensity variation
	maxModulationSpeed: 0.05,  // Fastest intensity variation
};
