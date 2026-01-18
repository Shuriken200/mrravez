// =============================================================================
// PhaseLayerAttraction - Phase 5: Apply layer attraction to orbs
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbBehaviors } from '../orb/core';
import { DEFAULT_ORB_SPAWN_CONFIG, DEFAULT_LAYER_ATTRACTION_CONFIG } from '../orb/config';

/**
 * Phase 5: Apply layer attraction.
 * 
 * Single Responsibility: Layer attraction force application only.
 */
export class PhaseLayerAttraction {
	/**
	 * Applies layer attraction to all orbs.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param totalLayers - Total number of z-layers.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static execute(orbs: Orb[], totalLayers: number, deltaTime: number): void {
		const { maxSize } = DEFAULT_ORB_SPAWN_CONFIG;
		const { attractionStrength } = DEFAULT_LAYER_ATTRACTION_CONFIG;

		for (const orb of orbs) {
			OrbBehaviors.applyLayerAttraction(orb, maxSize, totalLayers, attractionStrength, deltaTime);
		}
	}
}
