/**
 * Configuration for scroll dot indicator
 * Centralizes dimensions, spacing, and timing values
 */

export interface DotConfig {
	// Dot dimensions
	dotSize: number; // px
	dotBorderRadius: string;

	// Spacing
	gap: number; // px
	desktopLeft: number; // px
	mobileBottom: number; // px
	labelOffset: number; // px

	// Label styling
	labelPadding: string;
	labelBorderRadius: number; // px
	labelFontSize: number; // px
	labelFontWeight: number;

	// Focus/hover effects
	hoverScale: number;
	focusScale: number;
	focusOutlineWidth: number; // px
	focusOutlineOffset: number; // px
	focusShadowBlur: number; // px

	// Transitions
	indicatorTransitionDuration: number; // seconds
	dotTransitionDuration: number; // seconds
	labelTransitionDuration: number; // seconds

	// Colors (theme-based, defined in CSS)
	// These are referenced as CSS custom properties
}

/**
 * Default configuration for dot indicator
 */
export const defaultDotConfig: DotConfig = {
	// Dot dimensions
	dotSize: 10,
	dotBorderRadius: "50%",

	// Spacing
	gap: 12,
	desktopLeft: 32,
	mobileBottom: 32,
	labelOffset: 12,

	// Label styling
	labelPadding: "6px 12px",
	labelBorderRadius: 8,
	labelFontSize: 14,
	labelFontWeight: 500,

	// Focus/hover effects
	hoverScale: 1.2,
	focusScale: 1.3,
	focusOutlineWidth: 3,
	focusOutlineOffset: 3,
	focusShadowBlur: 4,

	// Transitions
	indicatorTransitionDuration: 0.5,
	dotTransitionDuration: 0.3,
	labelTransitionDuration: 0.2,
};

/**
 * Singleton configuration instance
 */
export const dotConfig: DotConfig = defaultDotConfig;
