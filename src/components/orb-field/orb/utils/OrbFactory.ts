// =============================================================================
// OrbFactory - Centralized orb creation
// =============================================================================

import { type Orb } from '../types';
import { generateAnimationDurations, generateWanderParams } from './OrbSpawnUtils';

/**
 * Parameters for creating an orb.
 */
export interface CreateOrbParams {
	/** Position X in pixels. */
	pxX: number;
	/** Position Y in pixels. */
	pxY: number;
	/** Z-layer (depth). */
	z: number;
	/** Velocity X component (pixels/second). */
	vx: number;
	/** Velocity Y component (pixels/second). */
	vy: number;
	/** Velocity Z component (pixels/second). */
	vz: number;
	/** Overall speed (pixels/second). */
	speed: number;
	/** Movement angle in radians. */
	angle: number;
	/** Orb size in grid cells. */
	size: number;
	/** Lifetime in milliseconds (use Infinity for permanent). */
	lifetimeMs: number;
	/** Optional spawn delay for staggered appearance (milliseconds). */
	spawnDelay?: number;
}

/**
 * Factory for creating Orb instances with consistent initialization.
 * 
 * Single Responsibility: Orb object creation only.
 */
export class OrbFactory {
	/**
	 * Creates a new orb with the specified parameters.
	 * Automatically generates animation durations and wander parameters.
	 * 
	 * @param params - Orb creation parameters.
	 * @returns A fully initialized Orb object.
	 */
	static create(params: CreateOrbParams): Orb {
		const {
			pxX,
			pxY,
			z,
			vx,
			vy,
			vz,
			speed,
			angle,
			size,
			lifetimeMs,
			spawnDelay = 0,
		} = params;

		const animDurations = generateAnimationDurations();
		const wanderParams = generateWanderParams();
		const now = performance.now();

		return {
			id: crypto.randomUUID(),
			pxX,
			pxY,
			z,
			vx,
			vy,
			vz,
			speed,
			angle,
			size,
			createdAt: now - spawnDelay,
			lifetimeMs,
			spawnAnimDurationMs: animDurations.spawnAnimDurationMs,
			despawnAnimDurationMs: animDurations.despawnAnimDurationMs,
			...wanderParams,
		};
	}
}
