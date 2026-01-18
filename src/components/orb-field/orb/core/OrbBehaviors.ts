// =============================================================================
// OrbBehaviors - Wander and layer attraction behaviors
// =============================================================================

import { type Orb } from '../types';

/**
 * Handles orb autonomous behaviors.
 * 
 * Single Responsibility: Behavior calculations only (wander, layer attraction).
 */
export class OrbBehaviors {
	/**
	 * Calculates the preferred Z-layer for an orb based on its size.
	 * Uses logarithmic mapping so smaller orbs prefer the front (low Z),
	 * and larger orbs prefer the back (high Z).
	 * 
	 * Formula scales dynamically with maxSize and totalLayers:
	 * - Size 1 always maps to layer 0 (front)
	 * - Size maxSize always maps to layer (totalLayers - 1) (back)
	 * - Intermediate sizes follow a logarithmic curve
	 * 
	 * @param size - The orb's size.
	 * @param maxSize - Maximum allowed orb size.
	 * @param totalLayers - Total number of Z-layers in the grid.
	 * @returns The preferred layer for this orb (0 to totalLayers-1).
	 */
	static getPreferredLayer(size: number, maxSize: number, totalLayers: number): number {
		// Logarithmic mapping: small orbs spread across front, large clustered at back
		// log(1) = 0, so size 1 maps to layer 0
		// log(maxSize) / log(maxSize) = 1, so maxSize maps to top layer
		const normalizedPosition = Math.log(size) / Math.log(maxSize);
		return (totalLayers - 1) * normalizedPosition;
	}

	/**
	 * Applies a gentle Z-axis attraction force toward the orb's preferred layer.
	 * The force is proportional to the distance from the preferred layer,
	 * creating a very slow drift that allows collisions to override it.
	 * 
	 * This is applied continuously, so orbs will always slowly return to
	 * their preferred depth even after being pushed away by collisions.
	 * 
	 * @param orb - The orb to apply attraction to.
	 * @param maxSize - Maximum allowed orb size.
	 * @param totalLayers - Total number of Z-layers in the grid.
	 * @param strength - Attraction strength (layers/s² acceleration).
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static applyLayerAttraction(
		orb: Orb,
		maxSize: number,
		totalLayers: number,
		strength: number,
		deltaTime: number
	): void {
		const preferredLayer = this.getPreferredLayer(orb.size, maxSize, totalLayers);
		const distanceToPreferred = preferredLayer - orb.z;

		// Apply acceleration proportional to distance (spring-like attraction)
		// Very weak force - takes many seconds to settle
		const acceleration = distanceToPreferred * strength;

		// Apply acceleration to Z velocity
		orb.vz += acceleration * deltaTime;

		// Cap Z velocity to prevent oscillation and ensure gentle movement
		// Max drift speed of 0.5 layers/second
		const maxDriftSpeed = 0.5;
		if (Math.abs(orb.vz) > maxDriftSpeed) {
			orb.vz = Math.sign(orb.vz) * maxDriftSpeed;
		}
	}

	/**
	 * Applies organic wander behavior to gradually change orb velocity direction.
	 * 
	 * Uses dual sine waves for smooth, natural-looking movement:
	 * - Primary wave controls direction change
	 * - Secondary wave modulates intensity (creates periods of more/less wandering)
	 * 
	 * Updates the orb's wander phases for the next frame.
	 * 
	 * @param orb - The orb to apply wander to.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static applyWander(orb: Orb, deltaTime: number): void {
		// Skip if deltaTime is invalid
		if (!isFinite(deltaTime) || deltaTime <= 0 || deltaTime > 1) return;

		// Update wander phases
		orb.wanderPhase += orb.wanderSpeed * deltaTime;
		orb.wanderModulationPhase += orb.wanderModulationSpeed * deltaTime;

		// Keep phases in 0-2π range to prevent overflow
		if (orb.wanderPhase > Math.PI * 2) orb.wanderPhase -= Math.PI * 2;
		if (orb.wanderModulationPhase > Math.PI * 2) orb.wanderModulationPhase -= Math.PI * 2;

		// Calculate current wander intensity (modulated by secondary wave)
		// Goes from 0.2 to 1.0, so there's always some wander but it varies
		const modulationFactor = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(orb.wanderModulationPhase));

		// Calculate angular change using sine wave for smooth direction changes
		const angularChange = Math.sin(orb.wanderPhase) * orb.wanderStrength * modulationFactor * deltaTime;

		// Skip if change is negligible or invalid
		if (!isFinite(angularChange) || Math.abs(angularChange) < 0.0001) return;

		// Get current speed (preserve it)
		const currentSpeed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
		if (currentSpeed < 0.1) return; // Don't wander if nearly stationary

		// Get current angle and apply change
		const currentAngle = Math.atan2(orb.vy, orb.vx);
		const newAngle = currentAngle + angularChange;

		// Apply new velocity direction while preserving speed
		orb.vx = Math.cos(newAngle) * currentSpeed;
		orb.vy = Math.sin(newAngle) * currentSpeed;
		orb.angle = newAngle;
	}
}
