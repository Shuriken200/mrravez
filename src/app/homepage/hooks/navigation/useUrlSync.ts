/**
 * Hook for synchronizing active section with URL path
 * Handles both normal and debug mode paths
 */

import { useEffect, useState } from "react";
import { debugModeService } from "../../services";

export interface UseUrlSyncOptions {
	enabled: boolean;
	hasPassedGreeting: boolean;
	activeSection: number;
}

/**
 * Syncs the URL path with the active section
 * Updates browser history without triggering navigation
 */
export function useUrlSync({ enabled, hasPassedGreeting, activeSection }: UseUrlSyncOptions): void {
	// Track debug mode state
	const [isDebugMode, setIsDebugMode] = useState(() => {
		if (typeof window === "undefined") return false;
		return debugModeService.isDebugModeActive();
	});

	// Listen for debug mode changes
	useEffect(() => {
		const handleDebugModeChange = (e: CustomEvent<{ enabled: boolean }>) => {
			setIsDebugMode(e.detail.enabled);
		};

		window.addEventListener("debugModeChanged", handleDebugModeChange as EventListener);

		// Check initial state on mount
		queueMicrotask(() => {
			setIsDebugMode(debugModeService.isDebugModeActive());
		});

		return () => {
			window.removeEventListener("debugModeChanged", handleDebugModeChange as EventListener);
		};
	}, []);

	// Update URL when active section changes or debug mode changes
	useEffect(() => {
		if (!enabled || !hasPassedGreeting) return;

		const targetPath = debugModeService.getSectionPath(activeSection, isDebugMode);
		const currentPath = window.location.pathname;

		// Don't update if we're already at the correct path
		if (currentPath !== targetPath) {
			window.history.replaceState(null, "", targetPath);
		}
	}, [activeSection, enabled, hasPassedGreeting, isDebugMode]);
}
