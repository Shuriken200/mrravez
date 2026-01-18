"use client";

// =============================================================================
// usePhysicsLoop - Orb physics simulation logic
// =============================================================================

import { useCallback } from 'react';
import { type Orb } from '../orb/types';
import { OrbMovement, OrbGridMarking, OrbBehaviors } from '../orb/core';
import { WallCollision, OrbOrbCollision, OrbAvoidance, MouseRepulsion } from '../collision';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { DEFAULT_SPEED_LIMIT_CONFIG, DEFAULT_LAYER_ATTRACTION_CONFIG, DEFAULT_CONTINUOUS_SPAWN_CONFIG } from '../orb/config';
import { DEFAULT_ORB_SPAWN_CONFIG } from '../orb/config';
import { type WindowSize } from '../shared/types';

/**
 * Options for the physics loop hook.
 */
interface UsePhysicsLoopOptions {
	/** Returns the current effective time (for pause/resume). */
	getEffectiveTime: () => number;
	/** Spawns random orbs at random positions. */
	spawnRandomOrbs: (count: number, screenWidth: number, screenHeight: number, grid: SpatialGrid, vpc: ViewportCells) => number;
	/** Syncs React state with orbsRef. */
	syncOrbsState: () => void;
}

/**
 * Return values from the physics loop hook.
 */
export interface UsePhysicsLoopReturn {
	/** Runs the physics simulation for one frame. */
	runPhysics: (
		easedProgress: number,
		deltaTime: number,
		orbsRef: React.MutableRefObject<Orb[]>,
		grid: SpatialGrid,
		vpc: ViewportCells,
		windowSize: WindowSize,
		mousePosRef: React.MutableRefObject<{ x: number; y: number } | null>,
		isPageVisibleRef: React.MutableRefObject<boolean>,
		burstTimeRef: React.MutableRefObject<number | null>,
		pausePhysicsRef: React.MutableRefObject<boolean>,
		disableCollisionsRef: React.MutableRefObject<boolean>,
		disableAvoidanceRef: React.MutableRefObject<boolean>,
		enableOrbSpawningRef: React.MutableRefObject<boolean>,
		enableOrbDespawningRef: React.MutableRefObject<boolean>
	) => void;
}

/**
 * Hook for orb physics simulation.
 * 
 * Single Responsibility: Physics update logic only.
 */
export function usePhysicsLoop(options: UsePhysicsLoopOptions): UsePhysicsLoopReturn {
	const { getEffectiveTime, spawnRandomOrbs, syncOrbsState } = options;

	const runPhysics = useCallback((
		easedProgress: number,
		deltaTime: number,
		orbsRef: React.MutableRefObject<Orb[]>,
		grid: SpatialGrid,
		vpc: ViewportCells,
		windowSize: WindowSize,
		mousePosRef: React.MutableRefObject<{ x: number; y: number } | null>,
		isPageVisibleRef: React.MutableRefObject<boolean>,
		burstTimeRef: React.MutableRefObject<number | null>,
		pausePhysicsRef: React.MutableRefObject<boolean>,
		disableCollisionsRef: React.MutableRefObject<boolean>,
		disableAvoidanceRef: React.MutableRefObject<boolean>,
		enableOrbSpawningRef: React.MutableRefObject<boolean>,
		enableOrbDespawningRef: React.MutableRefObject<boolean>
	) => {
		if (easedProgress >= 1 && !pausePhysicsRef.current) {
			const currentOrbs = orbsRef.current;

			// Phase 1: Mark all orbs at current positions
			grid.clearDynamic();
			for (const orb of currentOrbs) {
				OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			}

			// Phase 2: Apply mouse repulsion
			if (!disableAvoidanceRef.current) {
				const mousePos = mousePosRef.current;
				if (mousePos) {
					MouseRepulsion.applyRepulsion(currentOrbs, mousePos.x, mousePos.y, deltaTime);
				}
			}

			// Phase 3: Apply speed limits
			const { baseMaxSpeed, minMaxSpeed, decelerationRate } = DEFAULT_SPEED_LIMIT_CONFIG;
			for (const orb of currentOrbs) {
				OrbMovement.applySpeedLimit(orb, baseMaxSpeed, minMaxSpeed, decelerationRate, deltaTime);
			}

			// Phase 4: Apply wander behavior
			for (const orb of currentOrbs) {
				OrbBehaviors.applyWander(orb, deltaTime);
			}

			// Phase 5: Apply layer attraction
			const { maxSize } = DEFAULT_ORB_SPAWN_CONFIG;
			const { attractionStrength } = DEFAULT_LAYER_ATTRACTION_CONFIG;
			const totalLayers = grid.config.layers;
			for (const orb of currentOrbs) {
				OrbBehaviors.applyLayerAttraction(orb, maxSize, totalLayers, attractionStrength, deltaTime);
			}

			// Phase 5.5: Apply orb-orb avoidance
			if (!disableAvoidanceRef.current) {
				OrbAvoidance.applyRepulsion(currentOrbs, vpc, deltaTime);
			}

			// Phase 5.6: Resolve orb-orb collisions
			if (!disableCollisionsRef.current) {
				OrbOrbCollision.resolveCollisions(currentOrbs, vpc);
			}

			// Phase 6: Check wall collisions and move
			for (const orb of currentOrbs) {
				OrbGridMarking.clearOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
				const collision = WallCollision.checkMove(orb, deltaTime, grid, vpc);
				OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);

				if (collision.blocked) {
					WallCollision.applyReflection(orb, collision.reflectX, collision.reflectY, collision.reflectZ);
				}
				OrbMovement.updatePosition(orb, deltaTime);
			}

			// Phase 6.5: Unstick orbs from walls
			for (const orb of currentOrbs) {
				OrbGridMarking.clearOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
				WallCollision.unstickFromWall(orb, grid, vpc);
				OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			}

			// Phase 8: Re-mark at new positions
			grid.clearDynamic();
			for (const orb of currentOrbs) {
				OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			}

			// Phase 9: Remove expired orbs
			const now = getEffectiveTime();
			if (enableOrbDespawningRef.current) {
				const expiredOrbs = currentOrbs.filter(orb => (now - orb.createdAt) > orb.lifetimeMs);
				if (expiredOrbs.length > 0) {
					for (const expiredOrb of expiredOrbs) {
						OrbGridMarking.clearOrbCircular(grid, expiredOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
					}
					orbsRef.current = currentOrbs.filter(orb => (now - orb.createdAt) <= orb.lifetimeMs);
					syncOrbsState();
				}
			}

			// Phase 10: Continuous spawning
			const burstTime = burstTimeRef.current;
			const isPageVisible = isPageVisibleRef.current;
			const { delayAfterBurstMs, targetOrbCountAt4K, referenceScreenArea, minOrbCount, baseSpawnRateAt4K, maxSpawnsPerFrame } = DEFAULT_CONTINUOUS_SPAWN_CONFIG;
			if (burstTime && (now - burstTime) > delayAfterBurstMs && isPageVisible && enableOrbSpawningRef.current) {
				const screenArea = windowSize.width * windowSize.height;
				const areaScale = screenArea / referenceScreenArea;
				const scaledCount = Math.round(targetOrbCountAt4K * areaScale);
				const targetCount = Math.max(minOrbCount, scaledCount);
				const baseSpawnRate = baseSpawnRateAt4K * areaScale;

				const currentCount = orbsRef.current.length;
				const deficit = targetCount - currentCount;

				if (deficit > 0) {
					const deficitRatio = Math.min(1, deficit / targetCount);
					const spawnRate = baseSpawnRate * deficitRatio;
					const expectedSpawns = spawnRate * deltaTime;
					const guaranteedSpawns = Math.floor(expectedSpawns);
					const fractionalChance = expectedSpawns - guaranteedSpawns;
					const extraSpawn = Math.random() < fractionalChance ? 1 : 0;
					const spawnsThisFrame = Math.min(guaranteedSpawns + extraSpawn, maxSpawnsPerFrame);

					if (spawnsThisFrame > 0) {
						spawnRandomOrbs(spawnsThisFrame, windowSize.width, windowSize.height, grid, vpc);
					}
				}
			}
		} else if (easedProgress >= 1 && pausePhysicsRef.current) {
			// When paused, still mark orbs for rendering
			const currentOrbs = orbsRef.current;
			grid.clearDynamic();
			for (const orb of currentOrbs) {
				OrbGridMarking.markOrbCircular(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			}
		}
	}, [getEffectiveTime, spawnRandomOrbs, syncOrbsState]);

	return {
		runPhysics,
	};
}
