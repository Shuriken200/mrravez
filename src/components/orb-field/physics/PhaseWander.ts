// =============================================================================
// PhaseWander - Phase 4: Apply wander behavior to orbs
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbBehaviors } from '../orb/core';

/**
 * Phase 4: Apply wander behavior.
 * 
 * Single Responsibility: Wander behavior only.
 */
export class PhaseWander {
	/**
	 * Applies wander behavior to all orbs.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static execute(orbs: Orb[], deltaTime: number): void {
		for (const orb of orbs) {
			OrbBehaviors.applyWander(orb, deltaTime);
		}
	}
}
