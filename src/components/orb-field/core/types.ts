// =============================================================================
// Core Grid Types
// =============================================================================

/** Cell states representing occupancy within the spatial grid. */
export const CELL_EMPTY = 0;
export const CELL_PROXIMITY = 1;
export const CELL_FILLED = 2;

export type CellState = typeof CELL_EMPTY | typeof CELL_PROXIMITY | typeof CELL_FILLED;

/**
 * Configuration interface for the 3D spatial grid.
 * All measurements are in centimeters to ensure consistency across different display densities.
 */
export interface GridConfig {
	/** Number of cells along the X-axis. */
	cellsX: number;
	/** Number of cells along the Y-axis. */
	cellsY: number;
	/** Number of depth layers (Z-axis). */
	layers: number;
	/** Width of a single cell in centimeters. */
	cellSizeXCm: number;
	/** Height of a single cell in centimeters. */
	cellSizeYCm: number;
	
	// Grid Bounds (World Coordinates in cm)
	/** Minimum X coordinate (extends left of the viewport). */
	minXCm: number;
	/** Maximum X coordinate (extends right of the viewport). */
	maxXCm: number;
	/** Minimum Y coordinate (extends above the viewport). */
	minYCm: number;
	/** Maximum Y coordinate (extends below the viewport). */
	maxYCm: number;
	
	// Viewport Bounds (Screen Area in cm)
	/** Viewport left edge in world coordinates (cm). */
	viewportMinXCm: number;
	/** Viewport right edge in world coordinates (cm). */
	viewportMaxXCm: number;
	/** Viewport top edge in world coordinates (cm). */
	viewportMinYCm: number;
	/** Viewport bottom edge in world coordinates (cm). */
	viewportMaxYCm: number;
	
	// Conversion Factors
	/** Ratio of pixels per centimeter based on device DPI. */
	pixelsPerCm: number;
	/** Ratio of centimeters per pixel based on device DPI. */
	cmPerPixel: number;
}
