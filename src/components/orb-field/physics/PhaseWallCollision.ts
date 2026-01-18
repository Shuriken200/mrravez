// =============================================================================
// PhaseWallCollision - Phase 6-6.5: Wall collision and unstick
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbGridMarking, OrbMovement } from '../orb/core';
import { WallCollision } from '../collision';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';

/**
 * Phase 6-6.5: Wall collision detection and unsticking.
 * 
 * Single Responsibility: Wall collision handling only.
 */
export class PhaseWallCollision {
	/**
	 * Checks for wall collisions, applies reflections, and unsticks orbs from walls.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param grid - Spatial grid for collision detection.
	 * @param vpc - Viewport cells for coordinate conversion.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static execute(
		orbs: Orb[],
		grid: SpatialGrid,
		vpc: ViewportCells,
		deltaTime: number
	): void {
		// Phase 6: Check wall collisions and move
		for (const orb of orbs) {
			OrbGridMarking.clearOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			const collision = WallCollision.checkMove(orb, deltaTime, grid, vpc);
			OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);

			if (collision.blocked) {
				WallCollision.applyReflection(orb, collision.reflectX, collision.reflectY, collision.reflectZ);
			}
			OrbMovement.updatePosition(orb, deltaTime);
		}

		// Phase 6.5: Unstick orbs from walls
		for (const orb of orbs) {
			OrbGridMarking.clearOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			WallCollision.unstickFromWall(orb, grid, vpc);
			OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
		}
	}
}
