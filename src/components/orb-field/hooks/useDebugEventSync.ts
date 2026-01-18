"use client";

// =============================================================================
// useDebugEventSync - Syncs debug refs from window events
// =============================================================================

import { useEffect } from 'react';

/**
 * Parameters for event sync hook.
 */
interface UseDebugEventSyncParams {
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
	handlePauseChange: (wasPaused: boolean, isPaused: boolean) => void;
}

/**
 * Syncs debug option refs from window custom events.
 * 
 * Single Responsibility: Event-to-refs synchronization only.
 */
export function useDebugEventSync(params: UseDebugEventSyncParams): void {
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
		handlePauseChange,
	} = params;

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
					handlePauseChange(wasPaused, isPaused);
					break;
			}
		};

		window.addEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		return () => {
			window.removeEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		};
	}, [
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
		handlePauseChange,
	]);
}
