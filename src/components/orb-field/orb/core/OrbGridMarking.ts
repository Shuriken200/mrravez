// =============================================================================
// OrbGridMarking - Grid occupancy tracking for orbs
// =============================================================================

import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { CELL_FILLED, CELL_PROXIMITY } from '../../shared/types';
import { type Orb } from '../types';

/**
 * Handles marking and clearing orb presence on the spatial grid.
 * 
 * Single Responsibility: Grid state updates for orbs only.
 */
export class OrbGridMarking {
	/**
	 * Marks an orb's footprint on the spatial grid.
	 * Uses bitwise OR for efficient floor operation.
	 *
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to mark.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static markOrb(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const cellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const cellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;
		const layer = Math.round(orb.z);

		grid.setCell(cellX, cellY, layer, CELL_FILLED);
	}

	/**
	 * Marks cells in a 3D spherical pattern based on orb size.
	 * 
	 * Orbs are 3D spheres that span multiple layers:
	 * - Size 1: 1x1x1 (single cell)
	 * - Size 2: 3D plus shape (extends 1 cell in each direction including Z)
	 * - Size 3+: Full 3D sphere
	 * 
	 * Also marks a 3D avoidance zone around the orb.
	 * 
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to mark.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static markOrbCircular(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const centerCellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const centerCellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;
		const centerLayer = Math.round(orb.z);

		// Radius is size - 1, ensuring each size is distinct:
		// Size 1 → radius 0 (1 cell), Size 2 → radius 1, etc.
		const radius = orb.size - 1;

		// Avoidance zone scales with orb size but with diminishing returns
		const avoidanceRadius = Math.floor(Math.sqrt(orb.size) + radius + 1);

		// 3D sphere marking - iterate over all three axes
		// First pass: Mark avoidance zone (yellow cells) in 3D
		for (let dz = -avoidanceRadius; dz <= avoidanceRadius; dz++) {
			for (let dy = -avoidanceRadius; dy <= avoidanceRadius; dy++) {
				for (let dx = -avoidanceRadius; dx <= avoidanceRadius; dx++) {
					const distSq = dx * dx + dy * dy + dz * dz;
					// Mark cells in avoidance shell (beyond orb but within avoidance radius)
					if (distSq > radius * radius && distSq <= avoidanceRadius * avoidanceRadius) {
						grid.addCellFlag(centerCellX + dx, centerCellY + dy, centerLayer + dz, CELL_PROXIMITY);
					}
				}
			}
		}

		// Second pass: Mark orb cells (red cells) in 3D
		for (let dz = -radius; dz <= radius; dz++) {
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dx = -radius; dx <= radius; dx++) {
					// Check if cell is within 3D spherical boundary
					if (dx * dx + dy * dy + dz * dz <= radius * radius) {
						grid.addCellFlag(centerCellX + dx, centerCellY + dy, centerLayer + dz, CELL_FILLED);
					}
				}
			}
		}
	}

	/**
	 * Clears an orb's footprint from the spatial grid.
	 * Uses removeCellFlag to preserve other flags.
	 *
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to clear.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static clearOrb(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const cellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const cellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;
		const layer = Math.round(orb.z);

		grid.removeCellFlag(cellX, cellY, layer, CELL_FILLED);
		grid.removeCellFlag(cellX, cellY, layer, CELL_PROXIMITY);
	}

	/**
	 * Clears an orb's 3D spherical footprint from the spatial grid.
	 * 
	 * Uses removeCellFlag to only remove this orb's flags without
	 * affecting other orbs or border flags.
	 * 
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to clear.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static clearOrbCircular(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const centerCellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const centerCellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;
		const centerLayer = Math.round(orb.z);
		const radius = orb.size - 1;
		const avoidanceRadius = Math.floor(Math.sqrt(orb.size) + radius + 1);

		// Clear 3D avoidance zone flags
		for (let dz = -avoidanceRadius; dz <= avoidanceRadius; dz++) {
			for (let dy = -avoidanceRadius; dy <= avoidanceRadius; dy++) {
				for (let dx = -avoidanceRadius; dx <= avoidanceRadius; dx++) {
					const distSq = dx * dx + dy * dy + dz * dz;
					if (distSq > radius * radius && distSq <= avoidanceRadius * avoidanceRadius) {
						grid.removeCellFlag(centerCellX + dx, centerCellY + dy, centerLayer + dz, CELL_PROXIMITY);
					}
				}
			}
		}

		// Clear 3D body flags
		for (let dz = -radius; dz <= radius; dz++) {
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dx = -radius; dx <= radius; dx++) {
					if (dx * dx + dy * dy + dz * dz <= radius * radius) {
						grid.removeCellFlag(centerCellX + dx, centerCellY + dy, centerLayer + dz, CELL_FILLED);
					}
				}
			}
		}
	}
}
