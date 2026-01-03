// =============================================================================
// Grid Renderer
// =============================================================================

import { type GridRevealConfig, type GridStyleConfig } from '../config';

interface WindowSize {
	width: number;
	height: number;
}

interface ViewportCells {
	startCellX: number;
	endCellX: number;
	startCellY: number;
	endCellY: number;
	cellSizeXPx: number;
	cellSizeYPx: number;
}

/**
 * Handles the pure rendering logic for the grid visualization.
 * Encapsulates all Canvas API calls and visual calculations.
 */
export class GridRenderer {
	/**
	 * Renders the grid frame based on the current state and configuration.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		windowSize: WindowSize,
		viewportCells: ViewportCells,
		progress: number,
		revealConfig: GridRevealConfig,
		styleConfig: GridStyleConfig,
		hoveredCell: { x: number; y: number } | null
	) {
		const { width, height } = windowSize;
		const { startCellX, endCellX, startCellY, endCellY, cellSizeXPx, cellSizeYPx } = viewportCells;
		const { startYOffset, endYOffset, fadeInDistance, whiteToGreyDistance } = revealConfig;
		const { lineColorGrey, baseAlpha, whiteAlpha, lineWidth, hoverLineWidth, hoverFillColor } = styleConfig;
		
		// Calculate animation boundaries
		const fadeEndY = startYOffset + progress * (height + endYOffset - startYOffset);
		const whiteStartY = fadeEndY - fadeInDistance;
		
		ctx.clearRect(0, 0, width, height);
		ctx.lineWidth = lineWidth;
		
		// Draw grid lines
		for (let cy = 0; cy <= (endCellY - startCellY); cy++) {
			const y = cy * cellSizeYPx;
			if (y > fadeEndY) continue;
			
			// 1. Calculate Reveal Opacity (Fade-in from bottom)
			let revealOpacity = 1;
			if (y > whiteStartY) {
				revealOpacity = Math.max(0, Math.min(1, (fadeEndY - y) / fadeInDistance));
				// Smoothstep ease
				revealOpacity = revealOpacity * revealOpacity * (3 - 2 * revealOpacity);
			}
			
			if (revealOpacity < 0.01) continue;
			
			// 2. Calculate Color Gradient (White to Grey)
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
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
			
			// Draw vertical lines for this row segment
			for (let cx = 0; cx <= (endCellX - startCellX); cx++) {
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
		
		// 3. Draw Hover Highlight
		if (progress >= 1 && hoveredCell) {
			const hx = (hoveredCell.x - startCellX) * cellSizeXPx;
			const hy = (hoveredCell.y - startCellY) * cellSizeYPx;
			
			ctx.fillStyle = hoverFillColor;
			ctx.fillRect(hx, hy, cellSizeXPx, cellSizeYPx);
			
			ctx.strokeStyle = 'rgba(80, 200, 150, 0.6)';
			ctx.lineWidth = hoverLineWidth;
			ctx.strokeRect(hx, hy, cellSizeXPx, cellSizeYPx);
		}
	}
}
