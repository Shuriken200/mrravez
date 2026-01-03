// =============================================================================
// Grid System Configuration
// =============================================================================

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
}

/**
 * Default configuration for grid geometry.
 */
export const DEFAULT_GRID_CONFIG: GridSystemConfig = {
	targetCellSizeCm: 0.5,
	extensionMultiplier: 1,
	layers: 20,
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
};
