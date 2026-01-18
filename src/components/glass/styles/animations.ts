/**
 * Animation timing and easing configurations
 */

export const animationTimings = {
	// Transition durations
	duration: {
		fast: '0.15s',
		normal: '0.3s',
		slow: '0.5s',
		verySlow: '0.6s',
	},
	// Easing functions
	easing: {
		smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
		easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
	},
} as const;

/**
 * Debounce defaults for interactions
 */
export const interactionDefaults = {
	hoverDebounce: 100,
	pressDebounce: 0,
} as const;

/**
 * Visibility timing defaults
 */
export const visibilityDefaults = {
	initialDelay: 10000, // 10 seconds
	fadeInDelay: 50,
	hideDelay: 100,
} as const;

/**
 * Default border radius values
 */
export const borderRadiusDefaults = {
	card: 60,
	button: 40,
	slider: 28,
	photo: '50%', // circular
} as const;

/**
 * Default padding values
 */
export const paddingDefaults = {
	card: 40,
	cardMobile: 24,
	button: '10px 24px 10px 12px',
	cardGap: 20,
} as const;

/**
 * Slider positioning defaults
 */
export const sliderPositionDefaults = {
	bottomDesktop: 48,
	// Mobile: Position above the dot indicator (32px bottom + ~40px for dots + spacing)
	bottomMobile: 80,
	zIndex: 9999,
	mobileBreakpoint: 768,
} as const;

/**
 * Dot indicator positioning (for coordination with slider)
 */
export const dotIndicatorDefaults = {
	bottomMobile: 32,
	dotSize: 10,
	gap: 12,
	// Total height: 3 dots + 2 gaps = 10 + 12 + 10 + 12 + 10 = 54 but horizontal so just 10px
	totalHeight: 10, // Single row on mobile (horizontal)
} as const;

/**
 * Card 3D and layout defaults
 */
export const cardDefaults = {
	perspective: '1200px',
	// Mobile vertical shift accounts for bottom UI elements (dots + slider)
	// Dots at 32px, slider at 80px (56px tall) = ~136px from bottom
	// Shift card up by 60px to create comfortable spacing
	mobileVerticalShift: 60,
	contentZOffset: 10,
} as const;

/**
 * Tilt animation defaults
 */
export const tiltDefaults = {
	mobileTiltMaxAngle: 18,
	desktopTiltMaxAngle: 8,
} as const;
