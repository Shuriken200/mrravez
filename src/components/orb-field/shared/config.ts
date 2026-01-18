// =============================================================================
// Grid System Configuration
// =============================================================================

/**
 * Configuration for grid geometry calculations.
 */
export interface GridSystemConfig {
	/** Target size for each grid cell in centimeters. */
	targetCellSizeCm: number;
	/** Extension multiplier (1 = grid extends 1 screen width/height in all directions). */
	extensionMultiplier: number;
	/** Number of depth layers along the Z-axis. */
	layers: number;
	/** Baseline DPI assumption for 1x displays. */
	baseDpi: number;
}

/**
 * Configuration for the grid reveal animation.
 */
export interface GridRevealConfig {
	/** Duration of the reveal animation in milliseconds. */
	duration: number;
	/** Start Y offset relative to screen top (pixels). */
	startYOffset: number;
	/** End Y offset relative to screen bottom (pixels). */
	endYOffset: number;
	/** Distance over which the grid fades from transparent to white (pixels). */
	fadeInDistance: number;
	/** Distance over which the grid fades from white to grey (pixels). */
	whiteToGreyDistance: number;
}

/**
 * Configuration for grid visual styles.
 */
export interface GridStyleConfig {
	/** Base RGB color values for the grey grid lines. */
	lineColorGrey: { r: number; g: number; b: number };
	/** Opacity for the grey lines. */
	baseAlpha: number;
	/** Opacity for the white lines at the reveal edge. */
	whiteAlpha: number;
	/** Width of the grid lines in pixels. */
	lineWidth: number;
	/** Border width for the hovered cell highlight. */
	hoverLineWidth: number;
	/** Fill color for the hovered cell. */
	hoverFillColor: string;
	/** Border color for the hovered cell. */
	hoverBorderColor: string;
	/** Fill color for occupied cells. */
	filledCellColor: string;
}

/**
 * Configuration for the OrbField component behavior.
 */
export interface OrbFieldConfig {
	/** Default base opacity of the canvas. */
	defaultOpacity: number;
	/** Progress threshold (0-1) at which fade-out begins in non-debug mode. */
	fadeOutStart: number;
	/** Z-index for the canvas element. */
	canvasZIndex: number;
	/** Z-index for the debug panel container. */
	debugPanelZIndex: number;
}

/**
 * Default configuration for grid geometry.
 */
export const DEFAULT_GRID_CONFIG: GridSystemConfig = {
	targetCellSizeCm: 0.5,
	extensionMultiplier: 1,
	layers: 100,
	baseDpi: 96,
};

/**
 * Default configuration for the reveal animation.
 */
export const DEFAULT_REVEAL_CONFIG: GridRevealConfig = {
	duration: 1500,
	startYOffset: -200,
	endYOffset: 500,
	fadeInDistance: 150,
	whiteToGreyDistance: 200,
};

/**
 * Default configuration for visual styles.
 */
export const DEFAULT_STYLE_CONFIG: GridStyleConfig = {
	lineColorGrey: { r: 100, g: 100, b: 130 },
	baseAlpha: 0.35,
	whiteAlpha: 0.7,
	lineWidth: 0.5,
	hoverLineWidth: 1.5,
	hoverFillColor: 'rgba(80, 200, 150, 0.2)',
	hoverBorderColor: 'rgba(80, 200, 150, 0.6)',
	filledCellColor: 'rgba(255, 80, 80, 0.6)',
};

/**
 * Default configuration for OrbField component behavior.
 */
export const DEFAULT_ORBFIELD_CONFIG: OrbFieldConfig = {
	defaultOpacity: 0.6,
	fadeOutStart: 0.8,
	canvasZIndex: 2,      // Debug canvas above homepage content
	debugPanelZIndex: 3,  // Debug panels above everything
};

/**
 * Configuration for parallax offset behavior.
 */
export interface ParallaxConfig {
	/** Pixels of grid/orb movement per viewport unit of scroll progress. */
	scrollOffsetPxPerUnit: number;
	/** Reference scroll progress where offset is zero (first resting point). */
	scrollOffsetReference: number;
	/** Smoothing factor for interpolating scroll offset (0-1, lower = smoother). */
	scrollOffsetSmoothing: number;
	/** Pixels of grid movement per unit of device tilt (0-1 range). */
	deviceTiltOffsetPx: number;
}

/**
 * Default configuration for parallax offset.
 */
export const DEFAULT_PARALLAX_CONFIG: ParallaxConfig = {
	scrollOffsetPxPerUnit: 100,
	scrollOffsetReference: 0.75,
	scrollOffsetSmoothing: 0.08,
	deviceTiltOffsetPx: 30,
};
