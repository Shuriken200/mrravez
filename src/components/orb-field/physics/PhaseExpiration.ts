// =============================================================================
// PhaseExpiration - Phase 9: Remove expired orbs
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbGridMarking } from '../orb/core';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';

/**
 * Phase 9: Orb expiration management.
 * 
 * Single Responsibility: Removing expired orbs only.
 */
export class PhaseExpiration {
	/**
	 * Removes expired orbs from the simulation.
	 * 
	 * @param orbsRef - Ref to orbs array (mutated in place).
	 * @param grid - Spatial grid for clearing expired orbs.
	 * @param vpc - Viewport cells for coordinate conversion.
	 * @param currentTime - Current effective time.
	 * @param enableOrbDespawning - Whether orb despawning is enabled.
	 * @param syncOrbsState - Function to sync React state.
	 */
	static execute(
		orbsRef: React.RefObject<Orb[]>,
		grid: SpatialGrid,
		vpc: ViewportCells,
		currentTime: number,
		enableOrbDespawning: boolean,
		syncOrbsState: () => void
	): void {
		if (!enableOrbDespawning) return;

		const currentOrbs = orbsRef.current;
		const expiredOrbs = currentOrbs.filter(orb => (currentTime - orb.createdAt) > orb.lifetimeMs);

		if (expiredOrbs.length > 0) {
			for (const expiredOrb of expiredOrbs) {
				OrbGridMarking.clearOrbCircular(grid, expiredOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			}
			orbsRef.current = currentOrbs.filter(orb => (currentTime - orb.createdAt) <= orb.lifetimeMs);
			syncOrbsState();
		}
	}
}
