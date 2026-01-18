// =============================================================================
// OrbMovement - Position updates and speed control
// =============================================================================

import { type Orb } from '../types';

/**
 * Handles orb movement and speed management.
 * 
 * Single Responsibility: Position and speed calculations only.
 */
export class OrbMovement {
	/**
	 * Updates an orb's position based on its velocity and delta time.
	 * Uses frame-rate independent calculation for all 3 axes.
	 *
	 * @param orb - The orb to update.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static updatePosition(orb: Orb, deltaTime: number): void {
		// Skip update if deltaTime is invalid (prevents NaN propagation)
		if (!isFinite(deltaTime) || deltaTime <= 0 || deltaTime > 1) return;

		const newX = orb.pxX + orb.vx * deltaTime;
		const newY = orb.pxY + orb.vy * deltaTime;
		const newZ = orb.z + orb.vz * deltaTime;

		// Only apply if results are finite (prevents NaN propagation)
		if (isFinite(newX)) orb.pxX = newX;
		if (isFinite(newY)) orb.pxY = newY;
		if (isFinite(newZ)) orb.z = newZ;
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
	 * Applies smooth speed limiting to an orb in 3D.
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
		// Calculate 3D speed (vz is in layers/sec, scale to match XY)
		const vzScaled = orb.vz * 20; // Scale Z velocity to be comparable to XY
		const currentSpeed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy + vzScaled * vzScaled);
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
			orb.vz *= scale;

			// Update the orb's stored speed value (XY plane for compatibility)
			orb.speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
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
}
