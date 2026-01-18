"use client";

// =============================================================================
// useDebugContextSync - Syncs debug refs from DebugContext
// =============================================================================

import { useEffect } from 'react';
import { useDebugSafe } from '@/components/debug';

/**
 * Parameters for context sync hook.
 */
interface UseDebugContextSyncParams {
	showGridRef: React.RefObject<boolean>;
	showCollisionAreaRef: React.RefObject<boolean>;
	showAvoidanceAreaRef: React.RefObject<boolean>;
	showGraphicsRef: React.RefObject<boolean>;
	enableOrbSpawningRef: React.RefObject<boolean>;
	enableOrbDespawningRef: React.RefObject<boolean>;
	enableSpawnOnClickRef: React.RefObject<boolean>;
	pausePhysicsRef: React.RefObject<boolean>;
	disableCollisionsRef: React.RefObject<boolean>;
	disableAvoidanceRef: React.RefObject<boolean>;
	showArrowVectorRef: React.RefObject<boolean>;
	showTruePositionRef: React.RefObject<boolean>;
	isDebugModeRef: React.RefObject<boolean>;
	handlePauseChange: (wasPaused: boolean, isPaused: boolean) => void;
}

/**
 * Syncs debug option refs from DebugContext state.
 * 
 * Single Responsibility: Context-to-refs synchronization only.
 */
export function useDebugContextSync(params: UseDebugContextSyncParams): void {
	const debugContext = useDebugSafe();

	// Destructure to create local bindings (React Compiler requirement)
	const {
		showGridRef,
		showCollisionAreaRef,
		showAvoidanceAreaRef,
		showGraphicsRef,
		enableOrbSpawningRef,
		enableOrbDespawningRef,
		enableSpawnOnClickRef,
		pausePhysicsRef,
		disableCollisionsRef,
		disableAvoidanceRef,
		showArrowVectorRef,
		showTruePositionRef,
		isDebugModeRef,
		handlePauseChange,
	} = params;

	useEffect(() => {
		if (!debugContext?.state) return;

		const state = debugContext.state;

		// Sync all refs in one go
		showGridRef.current = state.showGrid;
		showCollisionAreaRef.current = state.showCollisionArea;
		showAvoidanceAreaRef.current = state.showAvoidanceArea;
		showGraphicsRef.current = state.showGraphics;
		enableOrbSpawningRef.current = state.enableOrbSpawning;
		enableOrbDespawningRef.current = state.enableOrbDespawning;
		enableSpawnOnClickRef.current = state.enableSpawnOnClick;
		showArrowVectorRef.current = state.showArrowVector;
		showTruePositionRef.current = state.showTruePosition;
		disableCollisionsRef.current = state.disableCollisions;
		disableAvoidanceRef.current = state.disableAvoidance;

		// Handle pause state change
		const wasPaused = pausePhysicsRef.current;
		const isPaused = state.pausePhysics;
		pausePhysicsRef.current = isPaused;

		handlePauseChange(wasPaused, isPaused);
	}, [
		debugContext?.state,
		showGridRef,
		showCollisionAreaRef,
		showAvoidanceAreaRef,
		showGraphicsRef,
		enableOrbSpawningRef,
		enableOrbDespawningRef,
		enableSpawnOnClickRef,
		pausePhysicsRef,
		disableCollisionsRef,
		disableAvoidanceRef,
		showArrowVectorRef,
		showTruePositionRef,
		isDebugModeRef,
		handlePauseChange,
	]);
}
