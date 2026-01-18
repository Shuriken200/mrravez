// =============================================================================
// OccupiedCellRenderer - Renders occupied cells (collision and avoidance zones)
// =============================================================================

import { CELL_FILLED, CELL_PROXIMITY, hasCellFlag } from '../../shared/types';
import { SpatialGrid } from '../core/SpatialGrid';

/**
 * Handles rendering of occupied cells (orb bodies and avoidance zones).
 * 
 * Single Responsibility: Occupied cell visualization only.
 */
export class OccupiedCellRenderer {
	/**
	 * Draws cells that are occupied (CELL_FILLED and CELL_PROXIMITY states).
	 * Renders in two passes to ensure red orb bodies always appear above yellow zones.
	 * 
	 * @param ctx - The 2D canvas rendering context.
	 * @param grid - SpatialGrid instance for cell state queries.
	 * @param startCellX - First cell X coordinate in viewport.
	 * @param endCellX - Last cell X coordinate in viewport.
	 * @param startCellY - First cell Y coordinate in viewport.
	 * @param endCellY - Last cell Y coordinate in viewport.
	 * @param cellSizeXPx - Cell width in pixels.
	 * @param cellSizeYPx - Cell height in pixels.
	 * @param currentLayer - Current visible depth layer.
	 * @param fillColor - Color for filled cells (orb bodies).
	 * @param extraCellsTop - Additional cells to render above viewport.
	 * @param extraCellsBottom - Additional cells to render below viewport.
	 * @param extraCellsLeft - Additional cells to render left of viewport.
	 * @param extraCellsRight - Additional cells to render right of viewport.
	 * @param showCollisionArea - Whether to show collision area cells.
	 * @param showAvoidanceArea - Whether to show avoidance area cells.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		grid: SpatialGrid,
		startCellX: number,
		endCellX: number,
		startCellY: number,
		endCellY: number,
		cellSizeXPx: number,
		cellSizeYPx: number,
		currentLayer: number,
		fillColor: string,
		extraCellsTop: number = 0,
		extraCellsBottom: number = 0,
		extraCellsLeft: number = 0,
		extraCellsRight: number = 0,
		showCollisionArea: boolean = true,
		showAvoidanceArea: boolean = true
	): void {
		const cyStart = -extraCellsTop;
		const cyEnd = (endCellY - startCellY) + extraCellsBottom;
		const cxStart = -extraCellsLeft;
		const cxEnd = (endCellX - startCellX) + extraCellsRight;

		// Pass 1: Draw proximity cells (yellow/avoidance zones)
		if (showAvoidanceArea) {
			ctx.fillStyle = 'rgba(255, 220, 0, 0.5)';
			for (let cy = cyStart; cy <= cyEnd; cy++) {
				for (let cx = cxStart; cx <= cxEnd; cx++) {
					const cellX = startCellX + cx;
					const cellY = startCellY + cy;
					const state = grid.getCell(cellX, cellY, currentLayer);

					if (hasCellFlag(state, CELL_PROXIMITY)) {
						ctx.fillRect(cx * cellSizeXPx, cy * cellSizeYPx, cellSizeXPx, cellSizeYPx);
					}
				}
			}
		}

		// Pass 2: Draw filled cells (red/orb bodies) on top
		if (showCollisionArea) {
			ctx.fillStyle = fillColor;
			for (let cy = cyStart; cy <= cyEnd; cy++) {
				for (let cx = cxStart; cx <= cxEnd; cx++) {
					const cellX = startCellX + cx;
					const cellY = startCellY + cy;
					const state = grid.getCell(cellX, cellY, currentLayer);

					if (hasCellFlag(state, CELL_FILLED)) {
						ctx.fillRect(cx * cellSizeXPx, cy * cellSizeYPx, cellSizeXPx, cellSizeYPx);
					}
				}
			}
		}
	}
}
