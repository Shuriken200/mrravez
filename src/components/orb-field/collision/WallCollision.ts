// =============================================================================
// WallCollision - Wall collision detection and resolution
// =============================================================================

import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';
import { type CollisionResult } from './types';

/**
 * Handles collision detection and resolution with walls.
 * 
 * Single Responsibility: Wall-based collision logic only.
 */
export class WallCollision {
	/**
	 * Checks if a 3D move would result in collision and returns resolution.
	 *
	 * Performs axis-independent collision detection for proper corner handling.
	 * Tests X-axis, Y-axis, Z-axis, and diagonal movements separately.
	 * For multi-cell orbs (size > 1), checks the 3D spherical footprint.
	 *
	 * @param orb - The orb attempting to move.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param grid - The spatial grid instance for collision queries.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @returns CollisionResult with blocking status and reflection axes.
	 */
	static checkMove(
		orb: Orb,
		deltaTime: number,
		grid: SpatialGrid,
		vpc: ViewportCells
	): CollisionResult {
		const nextX = orb.pxX + orb.vx * deltaTime;
		const nextY = orb.pxY + orb.vy * deltaTime;
		const nextZ = orb.z + orb.vz * deltaTime;

		const currCellX = ((orb.pxX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const currCellY = ((orb.pxY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;
		const currLayer = Math.round(orb.z);
		const nextCellX = ((nextX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const nextCellY = ((nextY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;
		const nextLayer = Math.round(nextZ);

		// For size 1 orbs, use simple single-cell collision
		// Each axis is checked independently to avoid cross-axis reflection
		// Use isWall() instead of isBlocking() - only bounce off actual walls, not other orbs
		if (orb.size === 1) {
			const blockedX = grid.isWall(nextCellX, currCellY, currLayer);
			const blockedY = grid.isWall(currCellX, nextCellY, currLayer);
			const blockedZ = grid.isWall(currCellX, currCellY, nextLayer);

			// Only reflect axes that are independently blocked
			// This preserves momentum in non-blocked axes (e.g., Z-bounce shouldn't affect X/Y)
			return {
				blocked: blockedX || blockedY || blockedZ,
				reflectX: blockedX,
				reflectY: blockedY,
				reflectZ: blockedZ,
			};
		}

		// For multi-cell orbs, check 3D spherical footprint
		// Radius is size - 1, ensuring each size is distinct
		const radius = orb.size - 1;
		let blockedX = false;
		let blockedY = false;
		let blockedZ = false;

		// Check cells in 3D spherical footprint at next position
		for (let dz = -radius; dz <= radius; dz++) {
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dx = -radius; dx <= radius; dx++) {
					if (dx * dx + dy * dy + dz * dz <= radius * radius) {
						// Check X-axis movement - use isWall() to only bounce off actual walls
						if (grid.isWall(nextCellX + dx, currCellY + dy, currLayer + dz)) {
							blockedX = true;
						}
						// Check Y-axis movement
						if (grid.isWall(currCellX + dx, nextCellY + dy, currLayer + dz)) {
							blockedY = true;
						}
						// Check Z-axis movement
						if (grid.isWall(currCellX + dx, currCellY + dy, nextLayer + dz)) {
							blockedZ = true;
						}
					}
				}
			}
		}

		return {
			blocked: blockedX || blockedY || blockedZ,
			reflectX: blockedX,
			reflectY: blockedY,
			reflectZ: blockedZ,
		};
	}

	/**
	 * Applies 3D collision response to orb velocity.
	 *
	 * Reflects velocity components on specified axes.
	 * Call this after detecting a collision via checkMove().
	 *
	 * @param orb - The orb to update.
	 * @param reflectX - Whether to reflect X-axis velocity.
	 * @param reflectY - Whether to reflect Y-axis velocity.
	 * @param reflectZ - Whether to reflect Z-axis velocity.
	 */
	static applyReflection(
		orb: Orb,
		reflectX: boolean,
		reflectY: boolean,
		reflectZ: boolean = false
	): void {
		if (reflectX) orb.vx = -orb.vx;
		if (reflectY) orb.vy = -orb.vy;
		if (reflectZ) orb.vz = -orb.vz;

		// Update the orb's angle to match the new velocity direction
		orb.angle = Math.atan2(orb.vy, orb.vx);
	}

	/**
	 * Checks if an orb's current position overlaps with a wall and pushes it out.
	 * 
	 * This is a safety mechanism to handle orbs that somehow got stuck inside walls
	 * (e.g., pushed by other orbs, spawned incorrectly, or due to floating point errors).
	 * 
	 * @param orb - The orb to check and fix.
	 * @param grid - The spatial grid instance for wall queries.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @returns True if the orb was stuck and was pushed out.
	 */
	static unstickFromWall(
		orb: Orb,
		grid: SpatialGrid,
		vpc: ViewportCells
	): boolean {
		const centerCellX = ((orb.pxX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const centerCellY = ((orb.pxY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;
		const centerLayer = Math.round(orb.z);
		const radius = orb.size - 1;

		// Check if any part of the orb is inside a wall
		let stuckX = false;
		let stuckY = false;
		let stuckZ = false;
		let pushDirX = 0;
		let pushDirY = 0;
		let pushDirZ = 0;

		// For size 1 orbs, check single cell
		if (orb.size === 1) {
			if (grid.isWall(centerCellX, centerCellY, centerLayer)) {
				// Determine push direction based on velocity (push opposite to movement)
				pushDirX = orb.vx !== 0 ? -Math.sign(orb.vx) : (Math.random() > 0.5 ? 1 : -1);
				pushDirY = orb.vy !== 0 ? -Math.sign(orb.vy) : (Math.random() > 0.5 ? 1 : -1);
				pushDirZ = orb.vz !== 0 ? -Math.sign(orb.vz) : 0;
				stuckX = stuckY = true;
			}
		} else {
			// For multi-cell orbs, check spherical footprint
			for (let dz = -radius; dz <= radius && !(stuckX && stuckY && stuckZ); dz++) {
				for (let dy = -radius; dy <= radius && !(stuckX && stuckY && stuckZ); dy++) {
					for (let dx = -radius; dx <= radius; dx++) {
						if (dx * dx + dy * dy + dz * dz <= radius * radius) {
							if (grid.isWall(centerCellX + dx, centerCellY + dy, centerLayer + dz)) {
								// Track which directions have walls
								if (dx !== 0) { stuckX = true; pushDirX = -Math.sign(dx); }
								if (dy !== 0) { stuckY = true; pushDirY = -Math.sign(dy); }
								if (dz !== 0) { stuckZ = true; pushDirZ = -Math.sign(dz); }
							}
						}
					}
				}
			}
		}

		// If stuck, push the orb out
		if (stuckX || stuckY || stuckZ) {
			const pushDistance = 2; // Push 2 cells worth
			const cellSizeXPx = 1 / vpc.invCellSizeXPx;
			const cellSizeYPx = 1 / vpc.invCellSizeYPx;

			if (stuckX && pushDirX !== 0) {
				orb.pxX += pushDirX * pushDistance * cellSizeXPx;
				orb.vx = Math.abs(orb.vx) * pushDirX; // Ensure velocity points away from wall
			}
			if (stuckY && pushDirY !== 0) {
				orb.pxY += pushDirY * pushDistance * cellSizeYPx;
				orb.vy = Math.abs(orb.vy) * pushDirY;
			}
			if (stuckZ && pushDirZ !== 0) {
				orb.z += pushDirZ * pushDistance;
				orb.vz = Math.abs(orb.vz) * pushDirZ;
			}

			orb.angle = Math.atan2(orb.vy, orb.vx);
			return true;
		}

		return false;
	}
}
