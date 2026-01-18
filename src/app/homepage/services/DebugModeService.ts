/**
 * Debug mode detection service
 * Abstracts debug mode checking logic from components
 */

const DEBUG_MODE_KEY = "debug-mode-enabled";

export interface DebugModeService {
	/**
	 * Check if debug mode is currently active
	 */
	isDebugModeActive(): boolean;

	/**
	 * Get the appropriate URL path for a section based on debug mode
	 */
	getSectionPath(sectionIndex: number, isDebugMode: boolean): string;
}

// URL paths for each section (normal mode)
const SECTION_PATHS = ["/about", "/links", "/contact"] as const;

// URL paths for each section (debug mode)
const DEBUG_SECTION_PATHS = ["/debug/about", "/debug/links", "/debug/contact"] as const;

/**
 * Default implementation using localStorage and URL pathname
 */
class DefaultDebugModeService implements DebugModeService {
	isDebugModeActive(): boolean {
		if (typeof window === "undefined") return false;

		// Check URL first
		if (window.location.pathname.startsWith("/debug")) {
			return true;
		}

		// Check localStorage
		const stored = localStorage.getItem(DEBUG_MODE_KEY);
		return stored === "true";
	}

	getSectionPath(sectionIndex: number, isDebugMode: boolean): string {
		const paths = isDebugMode ? DEBUG_SECTION_PATHS : SECTION_PATHS;
		return paths[sectionIndex] ?? paths[0];
	}
}

/**
 * Singleton instance for app-wide use
 */
export const debugModeService: DebugModeService = new DefaultDebugModeService();

/**
 * Export paths for use in configuration
 */
export { SECTION_PATHS, DEBUG_SECTION_PATHS };
