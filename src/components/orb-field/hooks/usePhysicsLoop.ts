"use client";

// =============================================================================
// usePhysicsLoop - Orchestrates physics simulation phases
// =============================================================================

import { useCallback } from 'react';
import { type PhysicsContext } from './types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import {
	PhaseGridMarking,
	PhaseMouseRepulsion,
	PhaseSpeedLimit,
	PhaseWander,
	PhaseLayerAttraction,
	PhaseOrbInteraction,
	PhaseWallCollision,
	PhaseExpiration,
	PhaseContinuousSpawn,
} from '../physics';

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
	runPhysics: (context: PhysicsContext) => void;
}

/**
 * Hook for orchestrating orb physics simulation phases.
 * 
 * Single Responsibility: Physics phase orchestration only.
 */
// Track callback recreation
let runPhysicsCreationCount = 0;

export function usePhysicsLoop(options: UsePhysicsLoopOptions): UsePhysicsLoopReturn {
	const { getEffectiveTime, spawnRandomOrbs, syncOrbsState } = options;

	const runPhysics = useCallback((context: PhysicsContext) => {
		const {
			easedProgress,
			deltaTime,
			orbsRef,
			grid,
			vpc,
			windowSize,
			mousePosRef,
			isPageVisibleRef,
			burstTimeRef,
			pausePhysicsRef,
			disableCollisionsRef,
			disableAvoidanceRef,
			enableOrbSpawningRef,
			enableOrbDespawningRef,
		} = context;

		if (easedProgress >= 1 && !pausePhysicsRef.current) {
			const currentOrbs = orbsRef.current;

			// Phase 1: Mark all orbs at current positions
			PhaseGridMarking.markInitial(currentOrbs, grid, vpc);

			// Phase 2: Apply mouse repulsion
			PhaseMouseRepulsion.execute(currentOrbs, mousePosRef.current, deltaTime, disableAvoidanceRef.current);

			// Phase 3: Apply speed limits
			PhaseSpeedLimit.execute(currentOrbs, deltaTime);

			// Phase 4: Apply wander behavior
			PhaseWander.execute(currentOrbs, deltaTime);

			// Phase 5: Apply layer attraction
			PhaseLayerAttraction.execute(currentOrbs, grid.config.layers, deltaTime);

			// Phase 5.5-5.6: Apply orb-orb interactions
			PhaseOrbInteraction.execute(currentOrbs, vpc, deltaTime, disableAvoidanceRef.current, disableCollisionsRef.current);

			// Phase 6-6.5: Check wall collisions and unstick
			PhaseWallCollision.execute(currentOrbs, grid, vpc, deltaTime);

			// Phase 8: Re-mark at new positions
			PhaseGridMarking.markFinal(currentOrbs, grid, vpc);

			// Phase 9: Remove expired orbs
			const now = getEffectiveTime();
			PhaseExpiration.execute(
				orbsRef,
				grid,
				vpc,
				now,
				enableOrbDespawningRef.current,
				syncOrbsState
			);

			// Phase 10: Continuous spawning
			PhaseContinuousSpawn.execute(
				orbsRef,
				grid,
				vpc,
				windowSize,
				now,
				burstTimeRef.current,
				isPageVisibleRef.current,
				enableOrbSpawningRef.current,
				spawnRandomOrbs,
				deltaTime
			);
		} else if (easedProgress >= 1 && pausePhysicsRef.current) {
			// When paused, still mark orbs for rendering
			PhaseGridMarking.markInitial(orbsRef.current, grid, vpc);
		}
	}, [getEffectiveTime, spawnRandomOrbs, syncOrbsState]);

	// Log when runPhysics is recreated
	console.log('[usePhysicsLoop] runPhysics created, count:', ++runPhysicsCreationCount);

	return {
		runPhysics,
	};
}
