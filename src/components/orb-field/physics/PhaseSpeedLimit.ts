// =============================================================================
// PhaseSpeedLimit - Phase 3: Apply speed limits to orbs
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbMovement } from '../orb/core';
import { DEFAULT_SPEED_LIMIT_CONFIG } from '../orb/config';

/**
 * Phase 3: Apply speed limits.
 * 
 * Single Responsibility: Speed limiting only.
 */
export class PhaseSpeedLimit {
	/**
	 * Applies speed limits to all orbs.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static execute(orbs: Orb[], deltaTime: number): void {
		const { baseMaxSpeed, minMaxSpeed, decelerationRate } = DEFAULT_SPEED_LIMIT_CONFIG;
		for (const orb of orbs) {
			OrbMovement.applySpeedLimit(orb, baseMaxSpeed, minMaxSpeed, decelerationRate, deltaTime);
		}
	}
}
