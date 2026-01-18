// =============================================================================
// HoverHighlight - Renders cell hover highlight
// =============================================================================

/**
 * Handles hover highlight rendering for cells.
 * 
 * Single Responsibility: Hover effect visualization only.
 */
export class HoverHighlight {
	/**
	 * Draws the hover highlight for the currently hovered cell.
	 * 
	 * @param ctx - The 2D canvas rendering context.
	 * @param hoveredCell - The cell being hovered (grid coordinates).
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param cellSizeXPx - Cell width in pixels.
	 * @param cellSizeYPx - Cell height in pixels.
	 * @param fillColor - Fill color for the highlight.
	 * @param borderColor - Border color for the highlight.
	 * @param borderWidth - Width of the highlight border.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		hoveredCell: { x: number; y: number },
		startCellX: number,
		startCellY: number,
		cellSizeXPx: number,
		cellSizeYPx: number,
		fillColor: string,
		borderColor: string,
		borderWidth: number
	): void {
		const hx = (hoveredCell.x - startCellX) * cellSizeXPx;
		const hy = (hoveredCell.y - startCellY) * cellSizeYPx;

		ctx.fillStyle = fillColor;
		ctx.fillRect(hx, hy, cellSizeXPx, cellSizeYPx);

		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.strokeRect(hx, hy, cellSizeXPx, cellSizeYPx);
	}
}
