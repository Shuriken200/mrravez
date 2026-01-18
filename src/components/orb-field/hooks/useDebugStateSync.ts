"use client";

// =============================================================================
// useDebugStateSync - Hook for synchronizing debug state with refs
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { useDebugSafe } from '@/components/debug';

/**
 * Debug option refs for high-performance loop access.
 */
export interface DebugOptionRefs {
	showGridRef: React.MutableRefObject<boolean>;
	showCollisionAreaRef: React.MutableRefObject<boolean>;
	showAvoidanceAreaRef: React.MutableRefObject<boolean>;
	showGraphicsRef: React.MutableRefObject<boolean>;
	enableOrbSpawningRef: React.MutableRefObject<boolean>;
	enableOrbDespawningRef: React.MutableRefObject<boolean>;
	enableSpawnOnClickRef: React.MutableRefObject<boolean>;
	pausePhysicsRef: React.MutableRefObject<boolean>;
	disableCollisionsRef: React.MutableRefObject<boolean>;
	disableAvoidanceRef: React.MutableRefObject<boolean>;
	showArrowVectorRef: React.MutableRefObject<boolean>;
	showTruePositionRef: React.MutableRefObject<boolean>;
	isDebugModeRef: React.MutableRefObject<boolean>;
	pausedAtTimeRef: React.MutableRefObject<number | null>;
	pausedTimeOffsetRef: React.MutableRefObject<number>;
}

/**
 * Return values from the debug state sync hook.
 */
interface UseDebugStateSyncReturn extends DebugOptionRefs {
	/** Whether debug mode is currently enabled. */
	isDebugMode: boolean;
	/** Function to get effective time (frozen when paused). */
	getEffectiveTime: () => number;
}

/**
 * Synchronizes debug context state with refs for high-performance loop access.
 * 
 * Handles:
 * - Debug option ref synchronization
 * - Debug event listeners (for when context is not available)
 * - Pause time tracking for freezing animations
 * - Debug mode state management
 * 
 * @returns Debug option refs and state.
 */
export function useDebugStateSync(): UseDebugStateSyncReturn {
	const debugContext = useDebugSafe();
	const [isDebugMode, setIsDebugMode] = useState(false);

	// Debug option refs for animation loop access
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
	const pausedAtTimeRef = useRef<number | null>(null);
	const pausedTimeOffsetRef = useRef(0);

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

			// Track pause/resume for time freezing
			if (!wasPaused && isPaused) {
				pausedAtTimeRef.current = performance.now();
			} else if (wasPaused && !isPaused) {
				if (pausedAtTimeRef.current !== null) {
					pausedTimeOffsetRef.current += performance.now() - pausedAtTimeRef.current;
					pausedAtTimeRef.current = null;
				}
			}
		}
	}, [debugContext?.state]);

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

					if (!wasPaused && isPaused) {
						pausedAtTimeRef.current = performance.now();
					} else if (wasPaused && !isPaused) {
						if (pausedAtTimeRef.current !== null) {
							pausedTimeOffsetRef.current += performance.now() - pausedAtTimeRef.current;
							pausedAtTimeRef.current = null;
						}
					}
					break;
			}
		};

		window.addEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		return () => {
			window.removeEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		};
	}, []);

	// Initialize debug mode on mount
	useEffect(() => {
		const getDebugMode = (): boolean => {
			if (typeof window === 'undefined') {
				return process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
			}
			const stored = localStorage.getItem('debug-mode-enabled');
			if (stored !== null) {
				return stored === 'true';
			}
			return process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
		};

		const debugMode = getDebugMode();
		isDebugModeRef.current = debugMode;
		queueMicrotask(() => {
			setIsDebugMode(debugMode);
		});

		const handleDebugModeChange = (e: CustomEvent) => {
			const enabled = e.detail.enabled;
			isDebugModeRef.current = enabled;
			queueMicrotask(() => {
				setIsDebugMode(enabled);
			});
		};

		window.addEventListener('debugModeChanged', handleDebugModeChange as EventListener);

		return () => {
			window.removeEventListener('debugModeChanged', handleDebugModeChange as EventListener);
		};
	}, []);

	/**
	 * Get the effective time for animations.
	 * When paused, returns the frozen time (time at pause).
	 * When not paused, returns current time minus accumulated pause duration.
	 */
	const getEffectiveTime = (): number => {
		const now = performance.now();
		if (pausePhysicsRef.current && pausedAtTimeRef.current !== null) {
			return pausedAtTimeRef.current - pausedTimeOffsetRef.current;
		}
		return now - pausedTimeOffsetRef.current;
	};

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
		pausedAtTimeRef,
		pausedTimeOffsetRef,
		isDebugMode,
		getEffectiveTime,
	};
}
