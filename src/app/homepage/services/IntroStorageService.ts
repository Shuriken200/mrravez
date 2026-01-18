/**
 * Storage abstraction for intro animation state persistence
 * Follows Dependency Inversion Principle - components depend on this interface,
 * not on concrete localStorage/cookie implementation
 */

export interface IntroStorageService {
	/**
	 * Check if the intro animation has been played before
	 */
	hasIntroBeenPlayed(): boolean;

	/**
	 * Mark the intro animation as played
	 */
	markIntroAsPlayed(): void;
}

// Cookie/localStorage key for tracking intro played state
const INTRO_PLAYED_KEY = "intro-played";

// Cookie expiry in days (1 year)
const COOKIE_EXPIRY_DAYS = 365;

/**
 * LocalStorage + Cookie implementation of IntroStorageService
 * Uses both for redundancy and cross-session persistence
 */
class LocalStorageIntroService implements IntroStorageService {
	hasIntroBeenPlayed(): boolean {
		if (typeof window === "undefined") return false;

		// Check localStorage first (more reliable)
		const stored = localStorage.getItem(INTRO_PLAYED_KEY);
		if (stored === "true") return true;

		// Fallback to cookie check
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split("=");
			if (name === INTRO_PLAYED_KEY && value === "true") {
				return true;
			}
		}

		return false;
	}

	markIntroAsPlayed(): void {
		if (typeof window === "undefined") return;

		// Set localStorage
		localStorage.setItem(INTRO_PLAYED_KEY, "true");

		// Set cookie with 1-year expiry
		const expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
		document.cookie = `${INTRO_PLAYED_KEY}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
	}
}

/**
 * Singleton instance for app-wide use
 */
export const introStorage: IntroStorageService = new LocalStorageIntroService();
