// =============================================================================
// Continuous Spawn Configuration
// =============================================================================

/**
 * Configuration for continuous orb spawning.
 */
export interface ContinuousSpawnConfig {
	/** Target number of orbs at 4K resolution (3840x2160). Scales linearly with screen area. */
	targetOrbCountAt4K: number;
	/** Reference screen area for 4K resolution (3840 * 2160). */
	referenceScreenArea: number;
	/** Minimum orb count for small screens (mobile devices). */
	minOrbCount: number;
	/** Delay after burst before continuous spawning starts (milliseconds). */
	delayAfterBurstMs: number;
	/** Base spawn rate per second when at 0 orbs (at 4K, scales with screen). */
	baseSpawnRateAt4K: number;
	/** Maximum orbs to spawn per frame. */
	maxSpawnsPerFrame: number;
	/** Margin around screen edge where orbs won't spawn (pixels). */
	edgeMarginPx: number;
}

/**
 * Default configuration for continuous orb spawning.
 * Orb count and spawn rate scale linearly with screen area.
 * At 4K: 600 orbs, at 1080p: ~150 orbs, minimum 50 orbs on mobile.
 */
export const DEFAULT_CONTINUOUS_SPAWN_CONFIG: ContinuousSpawnConfig = {
	targetOrbCountAt4K: 600,           // Target at 4K resolution (reduced by 2/5ths)
	referenceScreenArea: 3840 * 2160,  // 4K resolution area (8,294,400 pixels)
	minOrbCount: 50,                   // Minimum orbs for mobile devices
	delayAfterBurstMs: 3000,           // Wait 3 seconds after burst
	baseSpawnRateAt4K: 50,             // Base spawn rate at 4K
	maxSpawnsPerFrame: 5,              // Max 5 orbs per frame for smooth spawning
	edgeMarginPx: 50,                  // Keep orbs 50px from screen edges
};
