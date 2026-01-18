// =============================================================================
// OrbSpawnUtils - Utility functions for orb spawning
// =============================================================================

import { DEFAULT_ORB_VISUAL_CONFIG } from '../visuals/OrbVisualConfig';
import { DEFAULT_WANDER_CONFIG } from '../config';

/**
 * Generates random animation durations for an orb.
 * Each orb gets unique spawn and despawn durations within the configured range.
 */
export function generateAnimationDurations(): {
	spawnAnimDurationMs: number;
	despawnAnimDurationMs: number;
} {
	const { spawnDurationMinMs, spawnDurationMaxMs, despawnDurationMinMs, despawnDurationMaxMs } = DEFAULT_ORB_VISUAL_CONFIG;
	return {
		spawnAnimDurationMs: spawnDurationMinMs + Math.random() * (spawnDurationMaxMs - spawnDurationMinMs),
		despawnAnimDurationMs: despawnDurationMinMs + Math.random() * (despawnDurationMaxMs - despawnDurationMinMs),
	};
}

/**
 * Generates random wander parameters for an orb.
 * Each orb gets unique wander characteristics for organic movement.
 */
export function generateWanderParams(): {
	wanderStrength: number;
	wanderPhase: number;
	wanderSpeed: number;
	wanderModulationSpeed: number;
	wanderModulationPhase: number;
} {
	const { minWanderStrength, maxWanderStrength, minWanderSpeed, maxWanderSpeed, minModulationSpeed, maxModulationSpeed } = DEFAULT_WANDER_CONFIG;
	return {
		wanderStrength: minWanderStrength + Math.random() * (maxWanderStrength - minWanderStrength),
		wanderPhase: Math.random() * Math.PI * 2, // Start at random phase
		wanderSpeed: minWanderSpeed + Math.random() * (maxWanderSpeed - minWanderSpeed),
		wanderModulationSpeed: minModulationSpeed + Math.random() * (maxModulationSpeed - minModulationSpeed),
		wanderModulationPhase: Math.random() * Math.PI * 2,
	};
}

/**
 * Generates a random orb size using weighted distribution.
 * Uses 1/(size^1.3) instead of 1/(size^2) for more balanced distribution.
 * 
 * @param maxSize - Maximum allowed orb size.
 * @returns A random size between 1 and maxSize.
 */
export function getRandomSize(maxSize: number): number {
	// Build cumulative weights: 1/(1^1.3), 1/(2^1.3), 1/(3^1.3), etc.
	const weights: number[] = [];
	let sum = 0;
	for (let size = 1; size <= maxSize; size++) {
		const weight = 1 / Math.pow(size, 1.3);
		sum += weight;
		weights.push(sum);
	}

	// Random selection
	const rand = Math.random() * sum;
	for (let i = 0; i < weights.length; i++) {
		if (rand <= weights[i]) {
			return i + 1;
		}
	}
	return 1; // Fallback
}
