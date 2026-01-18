// =============================================================================
// OrbAvoidance - Soft repulsion between orbs' avoidance zones
// =============================================================================

import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';

/**
 * Handles soft avoidance repulsion between orbs.
 * 
 * Single Responsibility: Avoidance zone soft repulsion only.
 * This applies gradual forces before orbs actually collide.
 */
export class OrbAvoidance {
	/**
	 * Applies soft 3D repulsion forces when orbs' avoidance zones overlap.
	 * 
	 * The closer orbs get, the stronger the repulsion force.
	 * Force is mass-weighted so larger orbs push smaller orbs more.
	 * Uses deltaTime for frame-rate independent, gradual velocity changes.
	 * 
	 * @param orbs - Array of all orbs to check.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param repulsionStrength - Base strength of the repulsion acceleration (default 200).
	 */
	static applyRepulsion(
		orbs: Orb[],
		vpc: ViewportCells,
		deltaTime: number,
		repulsionStrength: number = 200
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

				// Calculate avoidance radii - ensure minimum buffer for all orb sizes
				const radiusA = orbA.size - 1;
				const radiusB = orbB.size - 1;
				// Avoidance zone: at least 1.0 cell beyond the body radius (was 0.5, too small for size-1)
				const avoidanceA = radiusA + 1.0;
				const avoidanceB = radiusB + 1.0;

				// Combined avoidance radius (when zones start to overlap)
				const combinedAvoidance = avoidanceA + avoidanceB;

				// Combined body radius (for hard collision, handled separately)
				const combinedBody = radiusA + radiusB + 1;

				// Handle zero-distance case with random separation direction
				let dist: number;
				let nx: number, ny: number, nz: number;

				if (distSq < 0.001) {
					// Generate random separation direction to unstick orbs
					const randomAngle = Math.random() * Math.PI * 2;
					const randomPhi = (Math.random() - 0.5) * Math.PI;
					nx = Math.cos(randomAngle) * Math.cos(randomPhi);
					ny = Math.sin(randomAngle) * Math.cos(randomPhi);
					nz = Math.sin(randomPhi);
					dist = 0.001;
				} else {
					dist = Math.sqrt(distSq);
					nx = dx / dist;
					ny = dy / dist;
					nz = dz / dist;
				}

				// Apply avoidance repulsion when zones overlap
				// Continue applying even during body overlap to provide continuous outward pressure
				// This helps prevent orbs from getting stuck together
				if (dist < combinedAvoidance) {
					// Calculate repulsion strength based on overlap
					// When in avoidance zone (not touching): gentle repulsion
					// When in body collision: stronger continuous pressure
					let overlap: number;
					let forceMultiplier: number;

					if (dist > combinedBody) {
						// In avoidance zone only - gentle repulsion
						// 0 at edge of avoidance, 1 at edge of body
						overlap = 1 - (dist - combinedBody) / (combinedAvoidance - combinedBody);
						forceMultiplier = 1.0;
					} else {
						// In body collision - apply stronger continuous pressure
						// This helps unstick overlapping orbs
						overlap = 1.0; // Maximum overlap factor
						forceMultiplier = 3.0; // Triple strength during collision for more forceful separation
					}

					// Quadratic falloff for smooth repulsion (stronger when closer)
					// This is now an acceleration, applied gradually via deltaTime
					const acceleration = overlap * overlap * repulsionStrength * forceMultiplier;

					// Mass-weighted repulsion (smaller orbs get pushed more)
					const massA = orbA.size;
					const massB = orbB.size;
					const totalMass = massA + massB;

					const accelA = acceleration * (massB / totalMass);
					const accelB = acceleration * (massA / totalMass);

					// Apply 3D repulsion as gradual acceleration (push orbs apart)
					// Guard against NaN propagation
					if (isFinite(accelA) && isFinite(accelB)) {
						orbA.vx -= accelA * nx * deltaTime;
						orbA.vy -= accelA * ny * deltaTime;
						orbA.vz -= accelA * nz * deltaTime;
						orbB.vx += accelB * nx * deltaTime;
						orbB.vy += accelB * ny * deltaTime;
						orbB.vz += accelB * nz * deltaTime;

						// Update angles to match new velocity directions
						orbA.angle = Math.atan2(orbA.vy, orbA.vx);
						orbB.angle = Math.atan2(orbB.vy, orbB.vx);
					}
				}
			}
		}
	}
}
