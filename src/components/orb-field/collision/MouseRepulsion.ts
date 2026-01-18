// =============================================================================
// MouseRepulsion - Mouse-based orb repulsion
// =============================================================================

import { type Orb } from '../orb/types';

/**
 * Handles mouse interaction repulsion for orbs.
 * 
 * Single Responsibility: Mouse-to-orb repulsion only.
 */
export class MouseRepulsion {
	/**
	 * Applies 2D mouse repulsion to all orbs.
	 * 
	 * The mouse acts as a repulsion point that pushes orbs away in the XY plane.
	 * Z-axis is not affected - this is purely 2D interaction.
	 * Each orb reacts to the mouse exactly once per frame (z-layer independent).
	 * 
	 * @param orbs - Array of all orbs to affect.
	 * @param mouseX - Mouse X position in pixels.
	 * @param mouseY - Mouse Y position in pixels.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param repulsionRadius - Radius in pixels within which orbs are affected.
	 * @param repulsionStrength - Base strength of the repulsion acceleration.
	 */
	static applyRepulsion(
		orbs: Orb[],
		mouseX: number,
		mouseY: number,
		deltaTime: number,
		repulsionRadius: number = 150,
		repulsionStrength: number = 80
	): void {
		// Skip if mouse position is invalid
		if (!isFinite(mouseX) || !isFinite(mouseY)) return;

		for (const orb of orbs) {
			// Calculate 2D distance from mouse to orb center (XY only)
			const dx = orb.pxX - mouseX;
			const dy = orb.pxY - mouseY;
			const distSq = dx * dx + dy * dy;

			// Skip if too far or at same position
			if (distSq >= repulsionRadius * repulsionRadius || distSq < 1) continue;

			const dist = Math.sqrt(distSq);

			// Calculate repulsion strength based on distance
			// Stronger when closer (inverse relationship)
			const normalizedDist = dist / repulsionRadius;
			const falloff = 1 - normalizedDist; // 1 at center, 0 at edge

			// Quadratic falloff for smooth, natural repulsion
			const acceleration = falloff * falloff * repulsionStrength;

			// Direction away from mouse (normalized)
			const nx = dx / dist;
			const ny = dy / dist;

			// Apply repulsion as acceleration (XY only, no Z)
			// Guard against NaN propagation
			if (isFinite(acceleration) && isFinite(nx) && isFinite(ny)) {
				orb.vx += acceleration * nx * deltaTime;
				orb.vy += acceleration * ny * deltaTime;

				// Update angle to match new velocity direction
				orb.angle = Math.atan2(orb.vy, orb.vx);
			}
		}
	}
}
