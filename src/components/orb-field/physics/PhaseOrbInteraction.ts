// =============================================================================
// PhaseOrbInteraction - Phase 5.5-5.6: Orb-orb avoidance and collision
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbAvoidance, OrbOrbCollision } from '../collision';
import { type ViewportCells } from '../grid/types';

/**
 * Phase 5.5-5.6: Orb-orb interaction (avoidance and collision).
 * 
 * Single Responsibility: Orb-to-orb interaction forces only.
 */
export class PhaseOrbInteraction {
	/**
	 * Applies orb-orb avoidance and resolves orb-orb collisions.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param vpc - Viewport cells for spatial queries.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param disableAvoidance - Whether avoidance is disabled.
	 * @param disableCollisions - Whether collisions are disabled.
	 */
	static execute(
		orbs: Orb[],
		vpc: ViewportCells,
		deltaTime: number,
		disableAvoidance: boolean,
		disableCollisions: boolean
	): void {
		// Phase 5.5: Apply orb-orb avoidance
		if (!disableAvoidance) {
			OrbAvoidance.applyRepulsion(orbs, vpc, deltaTime);
		}

		// Phase 5.6: Resolve orb-orb collisions
		if (!disableCollisions) {
			OrbOrbCollision.resolveCollisions(orbs, vpc);
		}
	}
}
