// =============================================================================
// Shared Types - Common type definitions used across grid and orb systems
// =============================================================================

/**
 * Represents the occupancy state of a single grid cell using bit flags.
 * Multiple states can be combined using bitwise OR.
 * Uses numeric values for efficient storage in Uint8Array.
 */
export type CellState = number;

/** Cell is unoccupied and available. */
export const CELL_EMPTY = 0;

/** Cell is within the proximity field of an orb (soft repulsion zone). */
export const CELL_PROXIMITY = 1 << 0;  // 0b00000001 = 1

/** Cell is directly occupied by an orb (hard collision zone). */
export const CELL_FILLED = 1 << 1;     // 0b00000010 = 2

/** Cell is a permanent border wall that blocks movement. */
export const CELL_BORDER = 1 << 2;     // 0b00000100 = 4

/**
 * Checks if a cell has a specific flag set.
 * 
 * @param cellState - The cell state to check.
 * @param flag - The flag to test for.
 * @returns True if the flag is set.
 */
export function hasCellFlag(cellState: CellState, flag: CellState): boolean {
	return (cellState & flag) !== 0;
}

/**
 * Adds a flag to a cell state.
 * 
 * @param cellState - The current cell state.
 * @param flag - The flag to add.
 * @returns The new cell state with the flag added.
 */
export function addCellFlag(cellState: CellState, flag: CellState): CellState {
	return cellState | flag;
}

/**
 * Removes a flag from a cell state.
 * 
 * @param cellState - The current cell state.
 * @param flag - The flag to remove.
 * @returns The new cell state with the flag removed.
 */
export function removeCellFlag(cellState: CellState, flag: CellState): CellState {
	return cellState & ~flag;
}

/**
 * Represents the current window dimensions.
 */
export interface WindowSize {
	width: number;
	height: number;
}
