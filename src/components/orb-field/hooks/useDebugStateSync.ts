"use client";

// =============================================================================
// useDebugStateSync - Orchestrates debug state management
// =============================================================================

import { usePauseTimeTracking, getEffectiveTime, type PauseTimeRefs } from './usePauseTimeTracking';
import { useDebugModeInit } from './useDebugModeInit';
import { useDebugOptionRefs, type DebugOptionRefs } from './useDebugOptionRefs';
import { useDebugContextSync } from './useDebugContextSync';
import { useDebugEventSync } from './useDebugEventSync';

/**
 * Return values from the debug state sync hook.
 */
export interface UseDebugStateSyncReturn extends DebugOptionRefs, PauseTimeRefs {
	/** Whether debug mode is currently enabled. */
	isDebugMode: boolean;
	/** Function to get effective time (frozen when paused). */
	getEffectiveTime: () => number;
}

/**
 * Orchestrates debug state management by composing focused sub-hooks.
 * 
 * Single Responsibility: Debug state orchestration only.
 */
export function useDebugStateSync(): UseDebugStateSyncReturn {
	// Create debug refs
	const refs = useDebugOptionRefs();

	// Pause time tracking
	const pauseTracking = usePauseTimeTracking();

	// Debug mode initialization
	const { isDebugMode } = useDebugModeInit(refs.isDebugModeRef);

	// Sync from context
	useDebugContextSync({
		...refs,
		handlePauseChange: pauseTracking.handlePauseChange,
	});

	// Sync from events
	useDebugEventSync({
		showGridRef: refs.showGridRef,
		showCollisionAreaRef: refs.showCollisionAreaRef,
		showAvoidanceAreaRef: refs.showAvoidanceAreaRef,
		showGraphicsRef: refs.showGraphicsRef,
		enableOrbSpawningRef: refs.enableOrbSpawningRef,
		enableOrbDespawningRef: refs.enableOrbDespawningRef,
		enableSpawnOnClickRef: refs.enableSpawnOnClickRef,
		pausePhysicsRef: refs.pausePhysicsRef,
		disableCollisionsRef: refs.disableCollisionsRef,
		disableAvoidanceRef: refs.disableAvoidanceRef,
		showArrowVectorRef: refs.showArrowVectorRef,
		showTruePositionRef: refs.showTruePositionRef,
		handlePauseChange: pauseTracking.handlePauseChange,
	});

	return {
		...refs,
		...pauseTracking,
		isDebugMode,
		getEffectiveTime: () => getEffectiveTime(refs.pausePhysicsRef, pauseTracking.pausedAtTimeRef, pauseTracking.pausedTimeOffsetRef),
	};
}
