"use client";

// =============================================================================
// useDebugOptionRefs - Creates refs for debug options
// =============================================================================

import { useRef } from 'react';

/**
 * Debug option refs for high-performance loop access.
 */
export interface DebugOptionRefs {
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
}

/**
 * Creates and returns all debug option refs.
 * 
 * Single Responsibility: Debug ref creation only.
 */
export function useDebugOptionRefs(): DebugOptionRefs {
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

	return {
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
