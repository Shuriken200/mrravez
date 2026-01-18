// =============================================================================
// PhaseMouseRepulsion - Phase 2: Apply mouse repulsion to orbs
// =============================================================================

import { type Orb } from '../orb/types';
import { MouseRepulsion } from '../collision';

/**
 * Phase 2: Apply mouse repulsion.
 * 
 * Single Responsibility: Mouse repulsion force application only.
 */
export class PhaseMouseRepulsion {
	/**
	 * Applies mouse repulsion to all orbs.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param mousePos - Current mouse position (or null).
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param disableAvoidance - Whether avoidance is disabled.
	 */
	static execute(
		orbs: Orb[],
		mousePos: { x: number; y: number } | null,
		deltaTime: number,
		disableAvoidance: boolean
	): void {
		if (!disableAvoidance && mousePos) {
			MouseRepulsion.applyRepulsion(orbs, mousePos.x, mousePos.y, deltaTime);
		}
	}
}
