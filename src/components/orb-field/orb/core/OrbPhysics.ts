// =============================================================================
// OrbPhysics - Geometry and Grid Interaction
// =============================================================================

import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { CELL_FILLED, CELL_PROXIMITY } from '../../shared/types';
import { type Orb } from '../types';

/**
 * Handles the physical representation and movement of orbs on the spatial grid.
 *
 * Single Responsibility: Translating orb state into grid modifications
 * and updating orb positions based on velocity.
 */
export class OrbPhysics {
	/**
	 * Updates an orb's position based on its velocity and delta time.
	 * Uses frame-rate independent calculation.
	 *
	 * @param orb - The orb to update.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static updatePosition(orb: Orb, deltaTime: number): void {
		orb.pxX += orb.vx * deltaTime;
		orb.pxY += orb.vy * deltaTime;
	}

	/**
	 * Calculates the maximum speed for an orb based on its size.
	 * Larger orbs have lower max speeds (inverse square root).
	 *
	 * @param size - The orb's size.
	 * @param baseMaxSpeed - Max speed for size 1 orbs.
	 * @param minMaxSpeed - Minimum max speed for largest orbs.
	 * @returns The maximum speed in pixels/second.
	 */
	static getMaxSpeed(size: number, baseMaxSpeed: number, minMaxSpeed: number): number {
		// Inverse square root: larger orbs are slower
		const maxSpeed = baseMaxSpeed / Math.sqrt(size);
		return Math.max(minMaxSpeed, maxSpeed);
	}

	/**
	 * Applies smooth speed limiting to an orb.
	 * If the orb exceeds its max speed, gradually decelerates with a smooth curve.
	 * Uses exponential interpolation for natural-feeling deceleration.
	 *
	 * @param orb - The orb to limit.
	 * @param baseMaxSpeed - Max speed for size 1 orbs.
	 * @param minMaxSpeed - Minimum max speed for largest orbs.
	 * @param decelerationRate - How quickly to approach max speed (0-1).
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static applySpeedLimit(
		orb: Orb,
		baseMaxSpeed: number,
		minMaxSpeed: number,
		decelerationRate: number,
		deltaTime: number
	): void {
		const currentSpeed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
		if (currentSpeed < 0.001) return; // Avoid division by zero

		const maxSpeed = this.getMaxSpeed(orb.size, baseMaxSpeed, minMaxSpeed);

		if (currentSpeed > maxSpeed) {
			// Calculate smooth deceleration factor
			// Use exponential decay for smooth curve: factor = 1 - (1 - rate)^(dt * 60)
			// The 60 normalizes for 60fps, so rate works consistently across frame rates
			const smoothFactor = 1 - Math.pow(1 - decelerationRate, deltaTime * 60);

			// Lerp current speed toward max speed
			const newSpeed = currentSpeed + (maxSpeed - currentSpeed) * smoothFactor;

			// Apply the new speed while preserving direction
			const scale = newSpeed / currentSpeed;
			orb.vx *= scale;
			orb.vy *= scale;

			// Update the orb's stored speed value
			orb.speed = newSpeed;
		}
	}

	/**
	 * Synchronizes velocity components (vx, vy) from speed and angle.
	 * Call this after modifying an orb's speed or angle directly.
	 *
	 * @param orb - The orb to synchronize.
	 */
	static syncVelocity(orb: Orb): void {
		orb.vx = Math.cos(orb.angle) * orb.speed;
		orb.vy = Math.sin(orb.angle) * orb.speed;
	}

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

		grid.setCell(cellX, cellY, orb.layer, CELL_FILLED);
	}

	/**
	 * Marks cells in a circular pattern based on orb size.
	 * 
	 * For multi-cell orbs (size > 1), marks all cells within the circular
	 * radius. Uses efficient circle rasterization with pre-computed offsets.
	 * Also marks an avoidance zone (proximity field) around the orb.
	 * 
	 * Uses addCellFlag so proximity and filled can coexist in the same cell.
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

		// Radius is size - 1, ensuring each size is distinct:
		// Size 1 → radius 0 (1 cell), Size 2 → radius 1 (5 cells), etc.
		const radius = orb.size - 1;

		// Avoidance zone scales with orb size but with diminishing returns
		// Uses square root for sublinear growth: sqrt(size) + 1
		// Size 1 → ~2 cells, Size 4 → ~3 cells, Size 9 → ~4 cells, Size 16 → ~5 cells
		const avoidanceRadius = Math.floor(Math.sqrt(orb.size) + radius + 1);

		// First pass: Mark avoidance zone (yellow cells)
		for (let dy = -avoidanceRadius; dy <= avoidanceRadius; dy++) {
			for (let dx = -avoidanceRadius; dx <= avoidanceRadius; dx++) {
				const distSq = dx * dx + dy * dy;
				// Mark cells in avoidance ring (beyond orb but within avoidance radius)
				if (distSq > radius * radius && distSq <= avoidanceRadius * avoidanceRadius) {
					grid.addCellFlag(centerCellX + dx, centerCellY + dy, orb.layer, CELL_PROXIMITY);
				}
			}
		}

		// Second pass: Mark orb cells (red cells)
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				// Check if cell is within circular boundary
				if (dx * dx + dy * dy <= radius * radius) {
					grid.addCellFlag(centerCellX + dx, centerCellY + dy, orb.layer, CELL_FILLED);
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

		grid.removeCellFlag(cellX, cellY, orb.layer, CELL_FILLED);
		grid.removeCellFlag(cellX, cellY, orb.layer, CELL_PROXIMITY);
	}

	/**
	 * Clears an orb's circular footprint from the spatial grid.
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
		const radius = orb.size - 1;
		const avoidanceRadius = Math.floor(Math.sqrt(orb.size) + radius + 1);

		// Clear avoidance zone flags
		for (let dy = -avoidanceRadius; dy <= avoidanceRadius; dy++) {
			for (let dx = -avoidanceRadius; dx <= avoidanceRadius; dx++) {
				const distSq = dx * dx + dy * dy;
				if (distSq > radius * radius && distSq <= avoidanceRadius * avoidanceRadius) {
					grid.removeCellFlag(centerCellX + dx, centerCellY + dy, orb.layer, CELL_PROXIMITY);
				}
			}
		}

		// Clear body flags
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				if (dx * dx + dy * dy <= radius * radius) {
					grid.removeCellFlag(centerCellX + dx, centerCellY + dy, orb.layer, CELL_FILLED);
				}
			}
		}
	}
}
