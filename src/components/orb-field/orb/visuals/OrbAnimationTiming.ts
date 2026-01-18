// =============================================================================
// OrbAnimationTiming - Calculates animation timing factors for orbs
// =============================================================================

import { type Orb } from '../types';
import { type OrbVisualConfig } from './OrbVisualConfig';

/**
 * Handles animation timing calculations for spawn/despawn effects.
 * 
 * Single Responsibility: Animation timing logic only.
 */
export class OrbAnimationTiming {
	/**
	 * Calculates the animation factor for spawn/despawn effects.
	 * 
	 * Returns a value from 0 to 1:
	 * - During spawn: 0 -> 1 over orb's spawnAnimDurationMs
	 * - During active life: 1
	 * - During despawn: 1 -> 0 over orb's despawnAnimDurationMs
	 * 
	 * Uses ease-out for spawn and ease-in for despawn for natural feel.
	 *
	 * @param orb - The orb being rendered (contains animation durations).
	 * @param currentTime - Current timestamp.
	 * @param config - Visual configuration with animation settings.
	 * @returns Animation factor from 0 (invisible) to 1 (fully visible).
	 */
	static calculateAnimationFactor(
		orb: Orb,
		currentTime: number,
		config: OrbVisualConfig
	): number {
		const { createdAt, lifetimeMs, spawnAnimDurationMs, despawnAnimDurationMs } = orb;
		const { animationEasePower } = config;
		const age = currentTime - createdAt;

		// Handle infinite lifetime orbs (manual spawns)
		if (!isFinite(lifetimeMs)) {
			// Only apply spawn animation
			if (age < spawnAnimDurationMs) {
				const t = age / spawnAnimDurationMs;
				// Ease-out: 1 - (1-t)^power
				return 1 - Math.pow(1 - t, animationEasePower);
			}
			return 1;
		}

		const timeRemaining = lifetimeMs - age;

		// Spawn phase: fade in and grow
		if (age < spawnAnimDurationMs) {
			const t = age / spawnAnimDurationMs;
			// Ease-out for spawn: starts fast, slows down
			return 1 - Math.pow(1 - t, animationEasePower);
		}

		// Despawn phase: fade out and shrink
		if (timeRemaining < despawnAnimDurationMs) {
			const t = timeRemaining / despawnAnimDurationMs;
			// Ease-in for despawn: starts slow, speeds up
			return Math.pow(t, animationEasePower);
		}

		// Active phase: fully visible
		return 1;
	}

	/**
	 * Calculates the depth factor from z-position.
	 * Returns 0 for closest (z=0) and 1 for furthest (z=totalLayers).
	 *
	 * @param z - Current z-position of the orb.
	 * @param totalLayers - Total number of z-layers.
	 * @returns Depth factor from 0 (close) to 1 (far).
	 */
	static calculateDepthFactor(z: number, totalLayers: number): number {
		return Math.max(0, Math.min(1, z / totalLayers));
	}
}
