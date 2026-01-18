"use client";

// =============================================================================
// useDebugModeInit - Initializes debug mode state
// =============================================================================

import { useState, useEffect } from 'react';

/**
 * Return values from the debug mode init hook.
 */
export interface UseDebugModeInitReturn {
	/** Whether debug mode is currently enabled. */
	isDebugMode: boolean;
}

/**
 * Initializes debug mode state from localStorage and listens for changes.
 * 
 * Single Responsibility: Debug mode initialization only.
 */
export function useDebugModeInit(isDebugModeRef: React.MutableRefObject<boolean>): UseDebugModeInitReturn {
	const [isDebugMode, setIsDebugMode] = useState(false);

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
	}, [isDebugModeRef]);

	return {
		isDebugMode,
	};
}
