// =============================================================================
// PhaseGridMarking - Phase 1 + 8: Initial and final grid marking
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbGridMarking } from '../orb/core';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';

/**
 * Phase 1 + 8: Grid marking for spatial queries.
 * 
 * Single Responsibility: Grid cell marking/unmarking only.
 */
export class PhaseGridMarking {
	/**
	 * Marks all orbs on the grid at their current positions (Phase 1).
	 * 
	 * @param orbs - Array of orbs to mark.
	 * @param grid - Spatial grid to mark cells in.
	 * @param vpc - Viewport cells for coordinate conversion.
	 */
	static markInitial(
		orbs: Orb[],
		grid: SpatialGrid,
		vpc: ViewportCells
	): void {
		grid.clearDynamic();
		for (const orb of orbs) {
			OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
		}
	}

	/**
	 * Re-marks all orbs on the grid after physics updates (Phase 8).
	 * 
	 * @param orbs - Array of orbs to mark.
	 * @param grid - Spatial grid to mark cells in.
	 * @param vpc - Viewport cells for coordinate conversion.
	 */
	static markFinal(
		orbs: Orb[],
		grid: SpatialGrid,
		vpc: ViewportCells
	): void {
		grid.clearDynamic();
		for (const orb of orbs) {
			OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
		}
	}
}
