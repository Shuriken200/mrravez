// =============================================================================
// SpatialGrid - 3D Grid Data Structure
// =============================================================================

import { CELL_EMPTY, type CellState, type GridConfig } from './types';

/**
 * 3D Spatial Grid for efficient collision detection and spatial queries.
 * Uses a flat Uint8Array for memory efficiency.
 *
 * Responsibility: Manages raw grid data and handles coordinate conversions.
 */
export class SpatialGrid {
	readonly config: GridConfig;
	private cells: Uint8Array;
	
	constructor(config: GridConfig) {
		this.config = config;
		const totalCells = config.cellsX * config.cellsY * config.layers;
		this.cells = new Uint8Array(totalCells);
	}
	
	/**
	 * Calculates the flat array index for a given 3D cell coordinate.
	 */
	private getIndex(cellX: number, cellY: number, layer: number): number {
		return (
			layer * this.config.cellsX * this.config.cellsY +
			cellY * this.config.cellsX +
			cellX
		);
	}
	
	/**
	 * Checks if the given coordinates are within the grid bounds.
	 */
	isInBounds(cellX: number, cellY: number, layer: number): boolean {
		return (
			cellX >= 0 && cellX < this.config.cellsX &&
			cellY >= 0 && cellY < this.config.cellsY &&
			layer >= 0 && layer < this.config.layers
		);
	}
	
	/**
	 * Retrieves the state of a specific cell.
	 * Returns CELL_EMPTY if out of bounds.
	 */
	getCell(cellX: number, cellY: number, layer: number): CellState {
		if (!this.isInBounds(cellX, cellY, layer)) return CELL_EMPTY;
		return this.cells[this.getIndex(cellX, cellY, layer)] as CellState;
	}
	
	/**
	 * Sets the state of a specific cell.
	 * No-op if out of bounds.
	 */
	setCell(cellX: number, cellY: number, layer: number, state: CellState): void {
		if (!this.isInBounds(cellX, cellY, layer)) return;
		this.cells[this.getIndex(cellX, cellY, layer)] = state;
	}
	
	/**
	 * Converts world coordinates (cm) to grid cell coordinates.
	 */
	worldToGrid(xCm: number, yCm: number, layer: number): { cellX: number; cellY: number; layer: number } {
		const cfg = this.config;
		const cellX = Math.floor((xCm - cfg.minXCm) / cfg.cellSizeXCm);
		const cellY = Math.floor((yCm - cfg.minYCm) / cfg.cellSizeYCm);
		const clampedLayer = Math.max(0, Math.min(cfg.layers - 1, Math.round(layer)));
		return { cellX, cellY, layer: clampedLayer };
	}
	
	/**
	 * Converts grid cell coordinates to world coordinates (cm), returning the center of the cell.
	 */
	gridToWorld(cellX: number, cellY: number, layer: number): { xCm: number; yCm: number; layer: number } {
		const cfg = this.config;
		const xCm = cfg.minXCm + (cellX + 0.5) * cfg.cellSizeXCm;
		const yCm = cfg.minYCm + (cellY + 0.5) * cfg.cellSizeYCm;
		return { xCm, yCm, layer };
	}
	
	/**
	 * Resets all cells in the grid to CELL_EMPTY.
	 */
	clear(): void {
		this.cells.fill(CELL_EMPTY);
	}
}
