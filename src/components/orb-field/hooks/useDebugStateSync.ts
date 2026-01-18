"use client";

// =============================================================================
// useDebugStateSync - Orchestrates debug state management
// =============================================================================

import { useEffect, useRef } from 'react';
import { useDebugSafe } from '@/components/debug';
import { usePauseTimeTracking, getEffectiveTime, type PauseTimeRefs } from './usePauseTimeTracking';
import { useDebugModeInit } from './useDebugModeInit';

/**
 * Return values from the debug state sync hook.
 * 
 * Provides access to debug state and refs for high-performance rendering loops.
 */
export interface UseDebugStateSyncReturn extends PauseTimeRefs {
	/** Whether debug mode is currently enabled. */
	isDebugMode: boolean;
	/** Function to get effective time (frozen when paused). */
	getEffectiveTime: () => number;
	/** Ref for show grid setting. */
	showGridRef: React.RefObject<boolean>;
	/** Ref for show collision area setting. */
	showCollisionAreaRef: React.RefObject<boolean>;
	/** Ref for show avoidance area setting. */
	showAvoidanceAreaRef: React.RefObject<boolean>;
	/** Ref for show graphics setting. */
	showGraphicsRef: React.RefObject<boolean>;
	/** Ref for enable orb spawning setting. */
	enableOrbSpawningRef: React.RefObject<boolean>;
	/** Ref for enable orb despawning setting. */
	enableOrbDespawningRef: React.RefObject<boolean>;
	/** Ref for enable spawn on click setting. */
	enableSpawnOnClickRef: React.RefObject<boolean>;
	/** Ref for pause physics setting. */
	pausePhysicsRef: React.RefObject<boolean>;
	/** Ref for disable collisions setting. */
	disableCollisionsRef: React.RefObject<boolean>;
	/** Ref for disable avoidance setting. */
	disableAvoidanceRef: React.RefObject<boolean>;
	/** Ref for show arrow vector setting. */
	showArrowVectorRef: React.RefObject<boolean>;
	/** Ref for show true position setting. */
	showTruePositionRef: React.RefObject<boolean>;
	/** Ref for debug mode state. */
	isDebugModeRef: React.RefObject<boolean>;
}

/**
 * Orchestrates debug state management by composing focused sub-hooks.
 * 
 * Single Responsibility: Debug state orchestration only.
 */
export function useDebugStateSync(): UseDebugStateSyncReturn {
	const debugContext = useDebugSafe();

	// Create debug refs (using local refs to allow mutation)
	const showGridRef = useRef(true);
	const showCollisionAreaRef = useRef(true);
	const showAvoidanceAreaRef = useRef(true);
	const showGraphicsRef = useRef(true);
	const enableOrbSpawningRef = useRef(true);
	const enableOrbDespawningRef = useRef(true);
	const enableSpawnOnClickRef = useRef(true);
	const pausePhysicsRef = useRef(false);
	const disableCollisionsRef = useRef(false);
	const disableAvoidanceRef = useRef(false);
	const showArrowVectorRef = useRef(true);
	const showTruePositionRef = useRef(true);
	const isDebugModeRef = useRef(false);

	// Pause time tracking
	const pauseTracking = usePauseTimeTracking();

	// Debug mode initialization
	const { isDebugMode } = useDebugModeInit(isDebugModeRef);

	// Sync debug options to refs from context
	useEffect(() => {
		if (debugContext?.state) {
			showGridRef.current = debugContext.state.showGrid;
			showCollisionAreaRef.current = debugContext.state.showCollisionArea;
			showAvoidanceAreaRef.current = debugContext.state.showAvoidanceArea;
			showGraphicsRef.current = debugContext.state.showGraphics;
			enableOrbSpawningRef.current = debugContext.state.enableOrbSpawning;
			enableOrbDespawningRef.current = debugContext.state.enableOrbDespawning;
			enableSpawnOnClickRef.current = debugContext.state.enableSpawnOnClick;
			showArrowVectorRef.current = debugContext.state.showArrowVector;
			showTruePositionRef.current = debugContext.state.showTruePosition;
			disableCollisionsRef.current = debugContext.state.disableCollisions;
			disableAvoidanceRef.current = debugContext.state.disableAvoidance;

			// Handle pause state change
			const wasPaused = pausePhysicsRef.current;
			const isPaused = debugContext.state.pausePhysics;
			pausePhysicsRef.current = isPaused;

			pauseTracking.handlePauseChange(wasPaused, isPaused);
		}
	}, [debugContext?.state, pauseTracking]);

	// Listen for debug option changes when context is not available (from GlassDebugMenu)
	useEffect(() => {
		const handleDebugOptionChange = (e: CustomEvent<{ key: string; value: boolean }>) => {
			const { key, value } = e.detail;
			switch (key) {
				case "showGrid":
					showGridRef.current = value;
					break;
				case "showCollisionArea":
					showCollisionAreaRef.current = value;
					break;
				case "showAvoidanceArea":
					showAvoidanceAreaRef.current = value;
					break;
				case "showGraphics":
					showGraphicsRef.current = value;
					break;
				case "showArrowVector":
					showArrowVectorRef.current = value;
					break;
				case "showTruePosition":
					showTruePositionRef.current = value;
					break;
				case "enableOrbSpawning":
					enableOrbSpawningRef.current = value;
					break;
				case "enableOrbDespawning":
					enableOrbDespawningRef.current = value;
					break;
				case "enableSpawnOnClick":
					enableSpawnOnClickRef.current = value;
					break;
				case "disableCollisions":
					disableCollisionsRef.current = value;
					break;
				case "disableAvoidance":
					disableAvoidanceRef.current = value;
					break;
				case "pausePhysics":
					const wasPaused = pausePhysicsRef.current;
					const isPaused = value;
					pausePhysicsRef.current = isPaused;
					pauseTracking.handlePauseChange(wasPaused, isPaused);
					break;
			}
		};

		window.addEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		return () => {
			window.removeEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		};
	}, [pauseTracking]);

	return {
		...pauseTracking,
		isDebugMode,
		getEffectiveTime: () => getEffectiveTime(pausePhysicsRef, pauseTracking.pausedAtTimeRef, pauseTracking.pausedTimeOffsetRef),
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
	};
}
