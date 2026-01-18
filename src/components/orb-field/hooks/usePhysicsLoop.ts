"use client";

// =============================================================================
// usePhysicsLoop - Orchestrates physics simulation phases
// =============================================================================

import { useCallback } from 'react';
import { type Orb } from '../orb/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type WindowSize } from '../shared/types';
import {
	PhaseGridMarking,
	PhaseMouseRepulsion,
	PhaseSpeedLimit,
	PhaseWander,
	PhaseLayerAttraction,
	PhaseOrbInteraction,
	PhaseWallCollision,
	PhaseLifecycle,
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
 * Hook for orchestrating orb physics simulation phases.
 * 
 * Single Responsibility: Physics phase orchestration only.
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

			// Phase 9-10: Remove expired orbs and spawn new ones
			const now = getEffectiveTime();
			PhaseLifecycle.execute(
				orbsRef,
				grid,
				vpc,
				windowSize,
				now,
				burstTimeRef.current,
				isPageVisibleRef.current,
				enableOrbDespawningRef.current,
				enableOrbSpawningRef.current,
				spawnRandomOrbs,
				syncOrbsState
			);
		} else if (easedProgress >= 1 && pausePhysicsRef.current) {
			// When paused, still mark orbs for rendering
			PhaseGridMarking.markInitial(orbsRef.current, grid, vpc);
		}
	}, [getEffectiveTime, spawnRandomOrbs, syncOrbsState]);

	return {
		runPhysics,
	};
}
