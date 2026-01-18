// =============================================================================
// GridRenderer - Orchestrates grid visualization rendering
// =============================================================================

import { type GridRevealConfig, type GridStyleConfig } from '../../shared/config';
import { type WindowSize } from '../../shared/types';
import { SpatialGrid } from '../core/SpatialGrid';
import { type ViewportCells } from '../types';
import { type Orb } from '../../orb/types';
import { type OrbDebugVisualConfig } from '../../orb/config';
import { OrbDebugOverlay } from './OrbDebugOverlay';
import { GridLineRenderer } from './GridLineRenderer';
import { OccupiedCellRenderer } from './OccupiedCellRenderer';
import { HoverHighlight } from './HoverHighlight';

/**
 * Orchestrates the rendering of all grid visualization components.
 * 
 * Single Responsibility: Coordinates sub-renderers only.
 */
export class GridRenderer {
	/**
	 * Renders a complete frame of the grid visualization.
	 *
	 * @param ctx - The 2D canvas rendering context.
	 * @param windowSize - Current window dimensions.
	 * @param viewportCells - Viewport cell metrics for coordinate conversion.
	 * @param progress - Animation progress (0 to 1).
	 * @param revealConfig - Configuration for reveal animation.
	 * @param styleConfig - Configuration for visual styles.
	 * @param hoveredCell - Currently hovered cell coordinates, or null.
	 * @param grid - SpatialGrid instance for cell state queries.
	 * @param currentLayer - Currently visible depth layer.
	 * @param orbs - Array of orbs to render debug visuals for.
	 * @param orbDebugConfig - Configuration for orb debug visualization.
	 * @param offsetX - Horizontal offset in pixels for parallax scrolling.
	 * @param offsetY - Vertical offset in pixels for parallax scrolling.
	 * @param showGrid - Whether to show grid lines (default: true).
	 * @param showCollisionArea - Whether to show collision area cells (default: true).
	 * @param showAvoidanceArea - Whether to show avoidance area cells (default: true).
	 * @param showArrowVector - Whether to show velocity arrow vectors (default: true).
	 * @param showTruePosition - Whether to show true position indicator dot (default: true).
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		windowSize: WindowSize,
		viewportCells: ViewportCells,
		progress: number,
		revealConfig: GridRevealConfig,
		styleConfig: GridStyleConfig,
		hoveredCell: { x: number; y: number } | null,
		grid: SpatialGrid | null = null,
		currentLayer: number = 0,
		orbs: Orb[] = [],
		orbDebugConfig?: OrbDebugVisualConfig,
		offsetX: number = 0,
		offsetY: number = 0,
		showGrid: boolean = true,
		showCollisionArea: boolean = true,
		showAvoidanceArea: boolean = true,
		showArrowVector: boolean = true,
		showTruePosition: boolean = true
	): void {
		const { width, height } = windowSize;
		const { startCellX, endCellX, startCellY, endCellY, cellSizeXPx, cellSizeYPx } = viewportCells;
		const { startYOffset, endYOffset, fadeInDistance, whiteToGreyDistance } = revealConfig;
		const {
			lineColorGrey,
			baseAlpha,
			whiteAlpha,
			lineWidth,
			hoverLineWidth,
			hoverFillColor,
			hoverBorderColor,
			filledCellColor
		} = styleConfig;

		// Calculate extra cells needed based on scroll offset
		const extraCellsTop = offsetY > 0 ? Math.ceil(offsetY / cellSizeYPx) + 1 : 0;
		const extraCellsBottom = offsetY < 0 ? Math.ceil(Math.abs(offsetY) / cellSizeYPx) + 1 : 0;
		const extraCellsLeft = offsetX > 0 ? Math.ceil(offsetX / cellSizeXPx) + 1 : 0;
		const extraCellsRight = offsetX < 0 ? Math.ceil(Math.abs(offsetX) / cellSizeXPx) + 1 : 0;

		// Calculate animation boundaries
		const fadeEndY = startYOffset + progress * (height + endYOffset - startYOffset + Math.abs(offsetY));
		const whiteStartY = fadeEndY - fadeInDistance;

		ctx.clearRect(0, 0, width, height);

		// Apply parallax offset translation
		ctx.save();
		ctx.translate(offsetX, offsetY);

		// Phase 1: Draw occupied cells (only after reveal completes)
		if (grid && progress >= 1 && (showCollisionArea || showAvoidanceArea)) {
			OccupiedCellRenderer.draw(
				ctx,
				grid,
				startCellX,
				endCellX,
				startCellY,
				endCellY,
				cellSizeXPx,
				cellSizeYPx,
				currentLayer,
				filledCellColor,
				extraCellsTop,
				extraCellsBottom,
				extraCellsLeft,
				extraCellsRight,
				showCollisionArea,
				showAvoidanceArea
			);
		}

		// Phase 2: Draw grid lines with reveal animation
		if (showGrid) {
			GridLineRenderer.draw(
				ctx,
				width,
				startCellX,
				endCellX,
				startCellY,
				endCellY,
				cellSizeXPx,
				cellSizeYPx,
				fadeEndY,
				whiteStartY,
				fadeInDistance,
				whiteToGreyDistance,
				lineColorGrey,
				baseAlpha,
				whiteAlpha,
				lineWidth,
				extraCellsTop,
				extraCellsBottom,
				extraCellsLeft,
				extraCellsRight
			);
		}

		// Phase 3: Draw hover highlight (only after reveal completes)
		if (progress >= 1 && hoveredCell) {
			HoverHighlight.draw(
				ctx,
				hoveredCell,
				startCellX,
				startCellY,
				cellSizeXPx,
				cellSizeYPx,
				hoverFillColor,
				hoverBorderColor,
				hoverLineWidth
			);
		}

		// Phase 4: Draw orb debug visuals (only after reveal completes)
		if (orbs.length > 0 && progress >= 1) {
			OrbDebugOverlay.draw(ctx, orbs, currentLayer, orbDebugConfig, showArrowVector, showTruePosition);
		}

		// Restore canvas state
		ctx.restore();
	}
}
