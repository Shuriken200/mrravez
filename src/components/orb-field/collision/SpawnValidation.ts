// =============================================================================
// SpawnValidation - Validates safe spawn locations for orbs
// =============================================================================

import { hasCellFlag, CELL_FILLED, CELL_BORDER } from '../shared/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';

/**
 * Handles validation of spawn positions for orbs.
 * 
 * Single Responsibility: Spawn position validation only.
 */
export class SpawnValidation {
	/**
	 * Validates if spawning at a 3D position is allowed.
	 *
	 * Prevents spawning in occupied cells or on border walls.
	 * For multi-cell orbs (size > 1), checks the entire 3D spherical footprint.
	 *
	 * @param pxX - Pixel X position where spawn is attempted.
	 * @param pxY - Pixel Y position where spawn is attempted.
	 * @param z - Z-layer for the spawn (continuous).
	 * @param size - Size of the orb in grid cells.
	 * @param grid - The spatial grid instance for occupancy queries.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @returns True if spawning is allowed, false if blocked.
	 */
	static canSpawn(
		pxX: number,
		pxY: number,
		z: number,
		size: number,
		grid: SpatialGrid,
		vpc: ViewportCells
	): boolean {
		const centerCellX = ((pxX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const centerCellY = ((pxY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;
		const centerLayer = Math.round(z);

		// For size 1 orbs, check single cell - only block on FILLED or BORDER
		if (size === 1) {
			const state = grid.getCell(centerCellX, centerCellY, centerLayer);
			return !hasCellFlag(state, CELL_FILLED) && !hasCellFlag(state, CELL_BORDER);
		}

		// For multi-cell orbs, check 3D spherical footprint
		// Radius is size - 1, ensuring each size is distinct
		const radius = size - 1;

		for (let dz = -radius; dz <= radius; dz++) {
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dx = -radius; dx <= radius; dx++) {
					if (dx * dx + dy * dy + dz * dz <= radius * radius) {
						const state = grid.getCell(centerCellX + dx, centerCellY + dy, centerLayer + dz);
						// Check if cell has blocking flags (FILLED or BORDER)
						if (hasCellFlag(state, CELL_FILLED) || hasCellFlag(state, CELL_BORDER)) {
							return false;
						}
					}
				}
			}
		}

		return true;
	}
}
