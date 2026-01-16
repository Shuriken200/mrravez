// =============================================================================
// CollisionSystem - Collision Detection and Resolution
// =============================================================================

import { hasCellFlag, CELL_FILLED, CELL_BORDER } from '../shared/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';

/**
 * Result of a 3D collision check containing blocking status and reflection axes.
 */
export interface CollisionResult {
	/** Whether any collision was detected. */
	blocked: boolean;
	/** Whether to reflect velocity on the X-axis. */
	reflectX: boolean;
	/** Whether to reflect velocity on the Y-axis. */
	reflectY: boolean;
	/** Whether to reflect velocity on the Z-axis. */
	reflectZ: boolean;
}

/**
 * Collision detection and resolution system.
 *
 * Single Responsibility: All collision logic in one place.
 * Separates concerns from physics (movement) and grid (storage).
 */
export class CollisionSystem {
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
		if (orb.size === 1) {
			const blockedX = grid.isBlocking(nextCellX, currCellY, currLayer);
			const blockedY = grid.isBlocking(currCellX, nextCellY, currLayer);
			const blockedZ = grid.isBlocking(currCellX, currCellY, nextLayer);
			const blockedDiag = grid.isBlocking(nextCellX, nextCellY, nextLayer);

			return {
				blocked: blockedX || blockedY || blockedZ || blockedDiag,
				reflectX: blockedX || (blockedDiag && nextCellX !== currCellX),
				reflectY: blockedY || (blockedDiag && nextCellY !== currCellY),
				reflectZ: blockedZ || (blockedDiag && nextLayer !== currLayer),
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
						// Check X-axis movement
						if (grid.isBlocking(nextCellX + dx, currCellY + dy, currLayer + dz)) {
							blockedX = true;
						}
						// Check Y-axis movement
						if (grid.isBlocking(currCellX + dx, nextCellY + dy, currLayer + dz)) {
							blockedY = true;
						}
						// Check Z-axis movement
						if (grid.isBlocking(currCellX + dx, currCellY + dy, nextLayer + dz)) {
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
	}

	/**
	 * Applies soft 3D repulsion forces when orbs' avoidance zones overlap.
	 * 
	 * The closer orbs get, the stronger the repulsion force.
	 * Force is mass-weighted so larger orbs push smaller orbs more.
	 * 
	 * @param orbs - Array of all orbs to check.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @param repulsionStrength - Base strength of the repulsion force (default 50).
	 */
	static applyAvoidanceRepulsion(
		orbs: Orb[],
		vpc: ViewportCells,
		repulsionStrength: number = 50
	): void {
		for (let i = 0; i < orbs.length; i++) {
			for (let j = i + 1; j < orbs.length; j++) {
				const orbA = orbs[i];
				const orbB = orbs[j];

				// Calculate 3D distance between centers in cells
				const cellAX = orbA.pxX * vpc.invCellSizeXPx;
				const cellAY = orbA.pxY * vpc.invCellSizeYPx;
				const cellAZ = orbA.z;
				const cellBX = orbB.pxX * vpc.invCellSizeXPx;
				const cellBY = orbB.pxY * vpc.invCellSizeYPx;
				const cellBZ = orbB.z;

				const dx = cellBX - cellAX;
				const dy = cellBY - cellAY;
				const dz = cellBZ - cellAZ;
				const distSq = dx * dx + dy * dy + dz * dz;

				if (distSq < 0.001) continue; // Avoid division by zero

				const dist = Math.sqrt(distSq);

				// Calculate avoidance radii (matching OrbPhysics formula)
				const radiusA = orbA.size - 1;
				const radiusB = orbB.size - 1;
				const avoidanceA = Math.floor(Math.sqrt(orbA.size) + radiusA + 1);
				const avoidanceB = Math.floor(Math.sqrt(orbB.size) + radiusB + 1);

				// Combined avoidance radius (when zones start to overlap)
				const combinedAvoidance = avoidanceA + avoidanceB;

				// Combined body radius (for hard collision, handled separately)
				const combinedBody = radiusA + radiusB + 1;

				// Check if avoidance zones overlap but not hard collision yet
				if (dist < combinedAvoidance && dist > combinedBody) {
					// Calculate repulsion strength based on overlap
					// 0 at edge of avoidance, 1 at edge of body
					const overlap = 1 - (dist - combinedBody) / (combinedAvoidance - combinedBody);

					// Quadratic falloff for smooth repulsion (stronger when closer)
					const force = overlap * overlap * repulsionStrength;

					// Direction from A to B (normalized) in 3D
					const nx = dx / dist;
					const ny = dy / dist;
					const nz = dz / dist;

					// Mass-weighted repulsion (smaller orbs get pushed more)
					const massA = orbA.size;
					const massB = orbB.size;
					const totalMass = massA + massB;

					const forceA = force * (massB / totalMass);
					const forceB = force * (massA / totalMass);

					// Apply 3D repulsion (push orbs apart)
					orbA.vx -= forceA * nx;
					orbA.vy -= forceA * ny;
					orbA.vz -= forceA * nz;
					orbB.vx += forceB * nx;
					orbB.vy += forceB * ny;
					orbB.vz += forceB * nz;
				}
			}
		}
	}

	/**
	 * Resolves 3D orb-orb collisions with mass-weighted elastic bounce.
	 * 
	 * Checks all pairs of orbs for overlap and applies impulses based on
	 * their relative masses (size). Larger orbs affect smaller orbs more.
	 * 
	 * Uses the elastic collision formula in 3D:
	 * v1' = v1 - (2*m2/(m1+m2)) * dot(v1-v2, n) * n
	 * v2' = v2 + (2*m1/(m1+m2)) * dot(v1-v2, n) * n
	 * 
	 * Also includes position correction to prevent orbs from getting stuck.
	 * 
	 * @param orbs - Array of all orbs to check.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 */
	static resolveOrbOrbCollisions(
		orbs: Orb[],
		vpc: ViewportCells
	): void {
		for (let i = 0; i < orbs.length; i++) {
			for (let j = i + 1; j < orbs.length; j++) {
				const orbA = orbs[i];
				const orbB = orbs[j];

				// Calculate 3D distance between centers in cells
				const cellAX = orbA.pxX * vpc.invCellSizeXPx;
				const cellAY = orbA.pxY * vpc.invCellSizeYPx;
				const cellAZ = orbA.z;
				const cellBX = orbB.pxX * vpc.invCellSizeXPx;
				const cellBY = orbB.pxY * vpc.invCellSizeYPx;
				const cellBZ = orbB.z;

				const dx = cellBX - cellAX;
				const dy = cellBY - cellAY;
				const dz = cellBZ - cellAZ;
				const distSq = dx * dx + dy * dy + dz * dz;

				// Combined radius (in cells) - orbs touch when distance <= sum of radii + 1
				const radiusA = orbA.size - 1;
				const radiusB = orbB.size - 1;
				const minDist = radiusA + radiusB + 1;

				if (distSq < minDist * minDist && distSq > 0.001) {
					// Collision detected
					const dist = Math.sqrt(distSq);
					const nx = dx / dist;
					const ny = dy / dist;
					const nz = dz / dist;

					// Use size as mass (larger orbs have more momentum)
					const massA = orbA.size;
					const massB = orbB.size;
					const totalMass = massA + massB;

					// Position correction: push orbs apart if overlapping
					const overlap = minDist - dist;
					if (overlap > 0) {
						// Distribute separation based on mass (smaller orbs move more)
						const separationA = (overlap * massB / totalMass) * 0.5;
						const separationB = (overlap * massA / totalMass) * 0.5;

						// Convert back to pixel space for XY, keep Z in layers
						const cellSizeXPx = 1 / vpc.invCellSizeXPx;
						const cellSizeYPx = 1 / vpc.invCellSizeYPx;

						orbA.pxX -= nx * separationA * cellSizeXPx;
						orbA.pxY -= ny * separationA * cellSizeYPx;
						orbA.z -= nz * separationA;
						orbB.pxX += nx * separationB * cellSizeXPx;
						orbB.pxY += ny * separationB * cellSizeYPx;
						orbB.z += nz * separationB;
					}

					// Relative velocity of A with respect to B in 3D
					const dvx = orbA.vx - orbB.vx;
					const dvy = orbA.vy - orbB.vy;
					const dvz = orbA.vz - orbB.vz;

					// Relative velocity in collision normal direction
					const dvn = dvx * nx + dvy * ny + dvz * nz;

					// Only resolve velocity if objects are approaching each other
					if (dvn > 0) {
						// Mass-weighted impulse factors
						// Smaller orbs get pushed more, larger orbs get pushed less
						const impulseA = (2 * massB / totalMass) * dvn;
						const impulseB = (2 * massA / totalMass) * dvn;

						orbA.vx -= impulseA * nx;
						orbA.vy -= impulseA * ny;
						orbA.vz -= impulseA * nz;
						orbB.vx += impulseB * nx;
						orbB.vy += impulseB * ny;
						orbB.vz += impulseB * nz;
					}
				}
			}
		}
	}
}
