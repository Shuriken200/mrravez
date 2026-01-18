// =============================================================================
// GridLineRenderer - Renders grid lines with reveal animation
// =============================================================================

/**
 * Handles grid line rendering with animated reveal.
 * 
 * Single Responsibility: Grid line drawing only.
 */
export class GridLineRenderer {
	/**
	 * Draws the grid lines with reveal animation gradient.
	 * 
	 * @param ctx - The 2D canvas rendering context.
	 * @param width - Canvas width.
	 * @param startCellX - First cell X coordinate in viewport.
	 * @param endCellX - Last cell X coordinate in viewport.
	 * @param startCellY - First cell Y coordinate in viewport.
	 * @param endCellY - Last cell Y coordinate in viewport.
	 * @param cellSizeXPx - Cell width in pixels.
	 * @param cellSizeYPx - Cell height in pixels.
	 * @param fadeEndY - Y position where reveal animation ends.
	 * @param whiteStartY - Y position where white-to-grey gradient starts.
	 * @param fadeInDistance - Distance over which lines fade in.
	 * @param whiteToGreyDistance - Distance over which color transitions.
	 * @param lineColorGrey - Target grey color RGB values.
	 * @param baseAlpha - Base alpha for grey lines.
	 * @param whiteAlpha - Alpha for white lines.
	 * @param lineWidth - Width of grid lines.
	 * @param extraCellsTop - Additional cells to render above viewport.
	 * @param extraCellsBottom - Additional cells to render below viewport.
	 * @param extraCellsLeft - Additional cells to render left of viewport.
	 * @param extraCellsRight - Additional cells to render right of viewport.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		width: number,
		startCellX: number,
		endCellX: number,
		startCellY: number,
		endCellY: number,
		cellSizeXPx: number,
		cellSizeYPx: number,
		fadeEndY: number,
		whiteStartY: number,
		fadeInDistance: number,
		whiteToGreyDistance: number,
		lineColorGrey: { r: number; g: number; b: number },
		baseAlpha: number,
		whiteAlpha: number,
		lineWidth: number,
		extraCellsTop: number = 0,
		extraCellsBottom: number = 0,
		extraCellsLeft: number = 0,
		extraCellsRight: number = 0
	): void {
		ctx.lineWidth = lineWidth;

		const cyStart = -extraCellsTop;
		const cyEnd = (endCellY - startCellY) + extraCellsBottom;
		const cxStart = -extraCellsLeft;
		const cxEnd = (endCellX - startCellX) + extraCellsRight;

		const extendedLineStartX = cxStart * cellSizeXPx;
		const extendedLineEndX = (cxEnd + 1) * cellSizeXPx;

		for (let cy = cyStart; cy <= cyEnd; cy++) {
			const y = cy * cellSizeYPx;
			if (y > fadeEndY) continue;

			// Calculate reveal opacity with smoothstep easing
			let revealOpacity = 1;
			if (y > whiteStartY) {
				revealOpacity = Math.max(0, Math.min(1, (fadeEndY - y) / fadeInDistance));
				revealOpacity = revealOpacity * revealOpacity * (3 - 2 * revealOpacity);
			}

			if (revealOpacity < 0.01) continue;

			// Calculate color gradient (white to grey) with smoothstep easing
			let greyMix = 0;
			const distAboveWhite = whiteStartY - y;
			if (distAboveWhite > 0) {
				greyMix = Math.min(1, distAboveWhite / whiteToGreyDistance);
				greyMix = greyMix * greyMix * (3 - 2 * greyMix);
			}

			const r = Math.round(255 - (255 - lineColorGrey.r) * greyMix);
			const g = Math.round(255 - (255 - lineColorGrey.g) * greyMix);
			const b = Math.round(255 - (255 - lineColorGrey.b) * greyMix);
			const alpha = (whiteAlpha - (whiteAlpha - baseAlpha) * greyMix) * revealOpacity;

			ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

			// Draw horizontal line
			ctx.beginPath();
			ctx.moveTo(extendedLineStartX, y);
			ctx.lineTo(extendedLineEndX, y);
			ctx.stroke();

			// Draw vertical lines for this row
			for (let cx = cxStart; cx <= cxEnd; cx++) {
				const x = cx * cellSizeXPx;
				const lineEndY = Math.min((cy + 1) * cellSizeYPx, fadeEndY);

				if (lineEndY > y) {
					ctx.beginPath();
					ctx.moveTo(x, y);
					ctx.lineTo(x, lineEndY);
					ctx.stroke();
				}
			}
		}
	}
}
