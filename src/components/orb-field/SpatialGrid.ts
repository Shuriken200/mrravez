// =============================================================================
// SpatialGrid - 3D Grid System
// =============================================================================
// 
// Grid specifications:
// - Extends 2x beyond the screen in every direction (X, Y) and in depth (Z)
// - Cell size based on physical display size (~1cm per cell)
// - Three cell states: Empty (0), Proximity (1), Filled (2)
// - Uses TypedArrays for efficient memory access
// =============================================================================

/** Cell states for the spatial grid */
export const CELL_EMPTY = 0;
export const CELL_PROXIMITY = 1;
export const CELL_FILLED = 2;

export type CellState = typeof CELL_EMPTY | typeof CELL_PROXIMITY | typeof CELL_FILLED;

/**
 * Configuration for the 3D spatial grid
 * All measurements in centimeters for real-world consistency
 */
export interface GridConfig {
    /** Number of cells in X direction */
    cellsX: number;
    /** Number of cells in Y direction */
    cellsY: number;
    /** Number of depth layers (Z direction) */
    layers: number;
    /** Cell size in X direction (cm) */
    cellSizeXCm: number;
    /** Cell size in Y direction (cm) */
    cellSizeYCm: number;
    
    // Grid bounds in centimeters (world coordinates)
    /** Minimum X coordinate (negative, extends left of viewport) */
    minXCm: number;
    /** Maximum X coordinate */
    maxXCm: number;
    /** Minimum Y coordinate (negative, extends above viewport) */
    minYCm: number;
    /** Maximum Y coordinate */
    maxYCm: number;
    
    // Viewport bounds in centimeters (screen area)
    /** Viewport left edge in world cm (typically 0) */
    viewportMinXCm: number;
    /** Viewport right edge in world cm */
    viewportMaxXCm: number;
    /** Viewport top edge in world cm (typically 0) */
    viewportMinYCm: number;
    /** Viewport bottom edge in world cm */
    viewportMaxYCm: number;
    
    // Conversion factors
    /** Pixels per centimeter */
    pixelsPerCm: number;
    /** Centimeters per pixel */
    cmPerPixel: number;
}

/**
 * Create grid configuration based on current window size
 * Returns null if called during SSR (no window)
 */
export function createGridConfig(): GridConfig | null {
    // Guard against SSR
    if (typeof window === 'undefined') return null;
    
    // Calculate physical dimensions using device pixel ratio
    // Standard assumption: 96 DPI at 1x device pixel ratio
    const dpi = (window.devicePixelRatio || 1) * 96;
    const cmPerPixel = 2.54 / dpi;
    const pixelsPerCm = dpi / 2.54;
    
    // Screen dimensions in cm
    const screenWidthCm = window.innerWidth * cmPerPixel;
    const screenHeightCm = window.innerHeight * cmPerPixel;
    
    // Target cell size: approximately 0.5cm (denser grid)
    const targetCellSizeCm = 0.5;
    
    // Calculate exact number of cells that fit in the viewport for each axis
    const cellsXPerViewport = Math.round(screenWidthCm / targetCellSizeCm);
    const cellsYPerViewport = Math.round(screenHeightCm / targetCellSizeCm);
    
    // Recalculate actual cell sizes to fit perfectly in viewport on both axes
    const cellSizeXCm = screenWidthCm / cellsXPerViewport;
    const cellSizeYCm = screenHeightCm / cellsYPerViewport;
    
    // Total cell counts (3x the viewport cells for 3x3 grid)
    const cellsX = cellsXPerViewport * 3;
    const cellsY = cellsYPerViewport * 3;
    
    // Depth layers - 20 layers provides good depth variation
    const layers = 20;
    
    // Grid bounds (world coordinates)
    // Viewport is at (0,0) to (screenWidthCm, screenHeightCm)
    // Grid starts 1 viewport width to the left and 1 above
    const minXCm = -screenWidthCm;
    const maxXCm = screenWidthCm * 2;
    const minYCm = -screenHeightCm;
    const maxYCm = screenHeightCm * 2;
    
    return {
        cellsX,
        cellsY,
        layers,
        cellSizeXCm,
        cellSizeYCm,
        minXCm,
        maxXCm,
        minYCm,
        maxYCm,
        viewportMinXCm: 0,
        viewportMaxXCm: screenWidthCm,
        viewportMinYCm: 0,
        viewportMaxYCm: screenHeightCm,
        pixelsPerCm,
        cmPerPixel,
    };
}

/**
 * 3D Spatial Grid for efficient collision detection and spatial queries
 * Uses a flat Uint8Array for memory efficiency
 */
export class SpatialGrid {
    /** Grid configuration */
    readonly config: GridConfig;
    
    /** Flat array storing cell states for all layers */
    private cells: Uint8Array;
    
    constructor(config: GridConfig) {
        this.config = config;
        
        // Allocate grid: X * Y * Z cells
        const totalCells = config.cellsX * config.cellsY * config.layers;
        this.cells = new Uint8Array(totalCells);
    }
    
    /**
     * Get flat array index from 3D coordinates
     */
    private getIndex(cellX: number, cellY: number, layer: number): number {
        return (
            layer * this.config.cellsX * this.config.cellsY +
            cellY * this.config.cellsX +
            cellX
        );
    }
    
    /**
     * Check if cell coordinates are within bounds
     */
    isInBounds(cellX: number, cellY: number, layer: number): boolean {
        return (
            cellX >= 0 && cellX < this.config.cellsX &&
            cellY >= 0 && cellY < this.config.cellsY &&
            layer >= 0 && layer < this.config.layers
        );
    }
    
    /**
     * Get cell state at given grid coordinates
     */
    getCell(cellX: number, cellY: number, layer: number): CellState {
        if (!this.isInBounds(cellX, cellY, layer)) return CELL_EMPTY;
        return this.cells[this.getIndex(cellX, cellY, layer)] as CellState;
    }
    
    /**
     * Set cell state at given grid coordinates
     */
    setCell(cellX: number, cellY: number, layer: number, state: CellState): void {
        if (!this.isInBounds(cellX, cellY, layer)) return;
        this.cells[this.getIndex(cellX, cellY, layer)] = state;
    }
    
    /**
     * Convert world coordinates (cm) to grid cell coordinates
     */
    worldToGrid(xCm: number, yCm: number, layer: number): { cellX: number; cellY: number; layer: number } {
        const cfg = this.config;
        
        // Offset from grid origin (minX, minY)
        const offsetX = xCm - cfg.minXCm;
        const offsetY = yCm - cfg.minYCm;
        
        // Convert to cell coordinates
        const cellX = Math.floor(offsetX / cfg.cellSizeXCm);
        const cellY = Math.floor(offsetY / cfg.cellSizeYCm);
        const clampedLayer = Math.max(0, Math.min(cfg.layers - 1, Math.round(layer)));
        
        return { cellX, cellY, layer: clampedLayer };
    }
    
    /**
     * Convert grid cell coordinates to world coordinates (cm)
     * Returns the center of the cell
     */
    gridToWorld(cellX: number, cellY: number, layer: number): { xCm: number; yCm: number; layer: number } {
        const cfg = this.config;
        
        const xCm = cfg.minXCm + (cellX + 0.5) * cfg.cellSizeXCm;
        const yCm = cfg.minYCm + (cellY + 0.5) * cfg.cellSizeYCm;
        
        return { xCm, yCm, layer };
    }
    
    /**
     * Check if a world position is within the viewport
     */
    isInViewport(xCm: number, yCm: number, margin: number = 0): boolean {
        const cfg = this.config;
        return (
            xCm >= cfg.viewportMinXCm - margin &&
            xCm <= cfg.viewportMaxXCm + margin &&
            yCm >= cfg.viewportMinYCm - margin &&
            yCm <= cfg.viewportMaxYCm + margin
        );
    }
    
    /**
     * Clear all cells in the grid
     */
    clear(): void {
        this.cells.fill(CELL_EMPTY);
    }
    
    /**
     * Get the raw cell array (for debug visualization)
     */
    getCells(): Uint8Array {
        return this.cells;
    }
}
