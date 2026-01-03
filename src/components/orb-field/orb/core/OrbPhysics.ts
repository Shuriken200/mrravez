// =============================================================================
// OrbPhysics - SRP: Geometry and Grid Interaction
// =============================================================================

import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { CELL_FILLED } from '../../shared/types';
import { type Orb } from '../types';

/**
 * Handles the physical representation and movement of orbs on the spatial grid.
 * Responsibility: Translating orb state into grid modifications and updating orb positions.
 */
export class OrbPhysics {
	/**
	 * Updates an orb's position based on its velocity and delta time.
	 * 
	 * @param orb - The Orb object to update.
	 * @param deltaTime - Time passed since last frame in seconds.
	 */
	static updatePosition(orb: Orb, deltaTime: number): void {
		orb.pxX += orb.vx * deltaTime;
		orb.pxY += orb.vy * deltaTime;
	}

	/**
	 * Synchronizes the velocity components (vx, vy) based on the current speed and angle.
	 * Call this after modifying an orb's speed or angle.
	 */
	static syncVelocity(orb: Orb): void {
		orb.vx = Math.cos(orb.angle) * orb.speed;
		orb.vy = Math.sin(orb.angle) * orb.speed;
	}

	/**
	 * Marks an orb's footprint on the grid.
	 * Uses highly efficient mapping from pixel coordinates to grid cells.
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
	 * Clears an orb's footprint from the grid.
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
		
		grid.setCell(cellX, cellY, orb.layer, 0); // 0 is CELL_EMPTY
	}
}
