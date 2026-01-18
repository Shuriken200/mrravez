"use client";

// =============================================================================
// useOrbSpawning - Orb burst and continuous spawning logic
// =============================================================================

import { useCallback, useMemo } from 'react';
import { type Orb } from '../types';
import { OrbGridMarking, OrbBehaviors } from '../core';
import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { type ViewportCells } from '../../grid/types';
import { DEFAULT_ORB_BURST_CONFIG, DEFAULT_CONTINUOUS_SPAWN_CONFIG, type OrbBurstConfig, type ContinuousSpawnConfig } from '../config';
import { SpawnValidation } from '../../collision';
import { generateAnimationDurations, generateWanderParams, getRandomSize } from '../utils';

/**
 * Options for the spawning hook.
 */
interface UseOrbSpawningOptions {
	/** Configuration for burst spawning. */
	burstConfig?: Partial<OrbBurstConfig>;
	/** Configuration for continuous spawning. */
	continuousConfig?: Partial<ContinuousSpawnConfig>;
}

/**
 * Return values from the spawning hook.
 */
export interface UseOrbSpawningReturn {
	/** Spawns a burst of orbs from a center point. */
	spawnOrbBurst: (centerX: number, centerY: number, grid: SpatialGrid, vpc: ViewportCells, orbsRef: React.MutableRefObject<Orb[]>, setOrbs: (orbs: Orb[]) => void) => void;
	/** Spawns random orbs at random positions across the viewport. */
	spawnRandomOrbs: (count: number, screenWidth: number, screenHeight: number, grid: SpatialGrid, vpc: ViewportCells, orbsRef: React.MutableRefObject<Orb[]>, setOrbs: (orbs: Orb[]) => void) => number;
}

/**
 * Hook for orb spawning operations (burst and continuous).
 * 
 * Single Responsibility: Orb spawning logic only.
 */
export function useOrbSpawning(options: UseOrbSpawningOptions = {}): UseOrbSpawningReturn {
	const burstConfig = useMemo(
		() => ({ ...DEFAULT_ORB_BURST_CONFIG, ...options.burstConfig }),
		[options.burstConfig]
	);
	const continuousConfig = useMemo(
		() => ({ ...DEFAULT_CONTINUOUS_SPAWN_CONFIG, ...options.continuousConfig }),
		[options.continuousConfig]
	);

	/**
	 * Spawns a burst of orbs from a center point with size-based distribution.
	 * 
	 * Implements:
	 * - Weighted size selection (power law with exponent 1.3 for balanced distribution)
	 * - Size-based layer assignment (larger orbs on back layers)
	 * - Size-scaled velocity (smaller orbs faster, larger orbs slower)
	 * - Collision-safe positioning with retries
	 * - Outward velocity from center point
	 * - Staggered spawn timing for organic appearance
	 * - Position jitter for non-circular explosion pattern
	 */
	const spawnOrbBurst = useCallback((
		centerX: number,
		centerY: number,
		grid: SpatialGrid,
		vpc: ViewportCells,
		orbsRef: React.MutableRefObject<Orb[]>,
		setOrbs: (orbs: Orb[]) => void
	) => {
		const { targetCount, maxSize, spawnRadiusPx, maxRetries, minSpeed, maxSpeed, minLifetimeMs, maxLifetimeMs, spawnDelayMaxMs, positionJitterPx } = burstConfig;
		const totalLayers = grid.config.layers;
		const newOrbs: Orb[] = [];

		// Helper: Get random position near center with organic distribution
		const getRandomPosition = (): { x: number; y: number } => {
			const angle = Math.random() * Math.PI * 2;
			const normalizedDistance = Math.pow(Math.random(), 0.6);
			const distance = normalizedDistance * spawnRadiusPx;

			const baseX = centerX + Math.cos(angle) * distance;
			const baseY = centerY + Math.sin(angle) * distance;

			const jitterX = (Math.random() - 0.5) * 2 * positionJitterPx;
			const jitterY = (Math.random() - 0.5) * 2 * positionJitterPx;

			return {
				x: baseX + jitterX,
				y: baseY + jitterY,
			};
		};

		// Spawn each orb
		for (let i = 0; i < targetCount; i++) {
			const size = getRandomSize(maxSize);
			const layer = OrbBehaviors.getPreferredLayer(size, maxSize, totalLayers);

			let spawnPos: { x: number; y: number } | null = null;
			let attempts = 0;

			while (attempts < maxRetries) {
				const pos = getRandomPosition();
				if (SpawnValidation.canSpawn(pos.x, pos.y, layer, size, grid, vpc)) {
					spawnPos = pos;
					break;
				}
				attempts++;
			}

			if (!spawnPos) continue;

			const dx = spawnPos.x - centerX;
			const dy = spawnPos.y - centerY;
			const angle = Math.atan2(dy, dx);

			const sizeSpeedFactor = 1 / Math.sqrt(size);
			const speedRandomness = Math.pow(Math.random(), 0.6);

			const scaledMinSpeed = minSpeed * sizeSpeedFactor;
			const scaledMaxSpeed = maxSpeed * sizeSpeedFactor;
			const speed = scaledMinSpeed + speedRandomness * (scaledMaxSpeed - scaledMinSpeed);

			const lifetimeMs = minLifetimeMs + Math.random() * (maxLifetimeMs - minLifetimeMs);
			const spawnDelay = Math.random() * spawnDelayMaxMs;

			const animDurations = generateAnimationDurations();
			const wanderParams = generateWanderParams();

			const now = performance.now();
			const newOrb: Orb = {
				id: crypto.randomUUID(),
				pxX: spawnPos.x,
				pxY: spawnPos.y,
				z: layer,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				vz: 0,
				speed,
				angle,
				size,
				createdAt: now - spawnDelay,
				lifetimeMs,
				spawnAnimDurationMs: animDurations.spawnAnimDurationMs,
				despawnAnimDurationMs: animDurations.despawnAnimDurationMs,
				...wanderParams,
			};

			OrbGridMarking.markOrbCircular(grid, newOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			newOrbs.push(newOrb);
		}

		orbsRef.current.push(...newOrbs);
		setOrbs([...orbsRef.current]);
	}, [burstConfig]);

	/**
	 * Spawns random orbs at random positions across the viewport.
	 * Uses the same size distribution and lifetime as burst spawning.
	 * Returns the number of orbs actually spawned.
	 */
	const spawnRandomOrbs = useCallback((
		count: number,
		screenWidth: number,
		screenHeight: number,
		grid: SpatialGrid,
		vpc: ViewportCells,
		orbsRef: React.MutableRefObject<Orb[]>,
		setOrbs: (orbs: Orb[]) => void
	): number => {
		const { maxSize, maxRetries, minSpeed, maxSpeed, minLifetimeMs, maxLifetimeMs } = burstConfig;
		const { edgeMarginPx } = continuousConfig;
		const totalLayers = grid.config.layers;
		const newOrbs: Orb[] = [];

		const getRandomPosition = (): { x: number; y: number } => {
			return {
				x: edgeMarginPx + Math.random() * (screenWidth - 2 * edgeMarginPx),
				y: edgeMarginPx + Math.random() * (screenHeight - 2 * edgeMarginPx),
			};
		};

		for (let i = 0; i < count; i++) {
			const size = getRandomSize(maxSize);
			const layer = OrbBehaviors.getPreferredLayer(size, maxSize, totalLayers);

			let spawnPos: { x: number; y: number } | null = null;
			let attempts = 0;

			while (attempts < maxRetries) {
				const pos = getRandomPosition();
				if (SpawnValidation.canSpawn(pos.x, pos.y, layer, size, grid, vpc)) {
					spawnPos = pos;
					break;
				}
				attempts++;
			}

			if (!spawnPos) continue;

			const angle = Math.random() * Math.PI * 2;

			const sizeSpeedFactor = 1 / Math.sqrt(size);
			const scaledMinSpeed = minSpeed * sizeSpeedFactor;
			const scaledMaxSpeed = maxSpeed * sizeSpeedFactor;
			const speed = scaledMinSpeed + Math.random() * (scaledMaxSpeed - scaledMinSpeed);

			const lifetimeMs = minLifetimeMs + Math.random() * (maxLifetimeMs - minLifetimeMs);

			const animDurations = generateAnimationDurations();
			const wanderParams = generateWanderParams();

			const newOrb: Orb = {
				id: crypto.randomUUID(),
				pxX: spawnPos.x,
				pxY: spawnPos.y,
				z: layer,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				vz: 0,
				speed,
				angle,
				size,
				createdAt: performance.now(),
				lifetimeMs,
				spawnAnimDurationMs: animDurations.spawnAnimDurationMs,
				despawnAnimDurationMs: animDurations.despawnAnimDurationMs,
				...wanderParams,
			};

			OrbGridMarking.markOrbCircular(grid, newOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			newOrbs.push(newOrb);
		}

		if (newOrbs.length > 0) {
			orbsRef.current.push(...newOrbs);
			setOrbs([...orbsRef.current]);
		}

		return newOrbs.length;
	}, [burstConfig, continuousConfig]);

	return {
		spawnOrbBurst,
		spawnRandomOrbs,
	};
}
