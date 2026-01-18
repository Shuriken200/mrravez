/**
 * Configuration for card transition animations and interactions
 * All timing, threshold, and sensitivity values centralized here
 * Following Open/Closed Principle - extend by modifying config, not code
 */

export interface TransitionConfig {
	// Snap behavior
	desktopSnapDelay: number; // ms - wait time before snapping to resting point
	snapThreshold: number; // viewport units - minimum distance to trigger snap
	
	// Scroll behavior
	scrollSensitivity: number; // multiplier for wheel scroll speed
	scrollDeltaDecay: number; // 0-1, how fast scroll delta decays for orb animations
	
	// Animation durations
	mobileSnapDuration: {
		base: number; // ms
		min: number; // ms
		max: number; // ms
	};
	desktopSnapDuration: {
		base: number; // ms
		min: number; // ms
		max: number; // ms
	};
	dotClickDuration: number; // ms - duration for dot navigation
	
	// Touch/swipe thresholds (duplicated from constants for centralization)
	swipeVelocityThreshold: number; // pixels per ms
	swipeDistanceThreshold: number; // fraction of viewport
	
	// Focus delays
	cardFocusDelay: number; // ms - delay before focusing card after transition
	fadeInDelay: number; // ms - delay between card fade-in animations
	
	// Transition durations for UI elements
	cardTransitionDuration: number; // seconds - CSS transition duration for cards
}

/**
 * Default configuration values
 * Extracted from useCardTransition, CardCarousel, and other components
 */
export const defaultTransitionConfig: TransitionConfig = {
	// Snap behavior
	desktopSnapDelay: 1000,
	snapThreshold: 0.05,
	
	// Scroll behavior
	scrollSensitivity: 3,
	scrollDeltaDecay: 0.92,
	
	// Animation durations
	mobileSnapDuration: {
		base: 350,
		min: 180,
		max: 500,
	},
	desktopSnapDuration: {
		base: 600,
		min: 500,
		max: 800,
	},
	dotClickDuration: 400,
	
	// Touch/swipe thresholds
	swipeVelocityThreshold: 5.0,
	swipeDistanceThreshold: 0.35,
	
	// Focus delays
	cardFocusDelay: 150,
	fadeInDelay: 50,
	
	// Transition durations
	cardTransitionDuration: 1.2,
};

/**
 * Singleton configuration instance
 * Can be replaced with a context provider if runtime configuration is needed
 */
export const transitionConfig: TransitionConfig = defaultTransitionConfig;
