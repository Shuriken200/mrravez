// =============================================================================
// Grid Types
// =============================================================================

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
	minXCm: number;
	maxXCm: number;
	minYCm: number;
	maxYCm: number;
	
	// Viewport Bounds (Screen Area in cm)
	viewportMinXCm: number;
	viewportMaxXCm: number;
	viewportMinYCm: number;
	viewportMaxYCm: number;
	
	// Conversion Factors
	pixelsPerCm: number;
	cmPerPixel: number;
}

export interface ViewportCells {
	startCellX: number;
	endCellX: number;
	startCellY: number;
	endCellY: number;
	cellSizeXPx: number;
	cellSizeYPx: number;
	invCellSizeXPx: number;
	invCellSizeYPx: number;
	cellSizeXCm: number;
	cellSizeYCm: number;
}

