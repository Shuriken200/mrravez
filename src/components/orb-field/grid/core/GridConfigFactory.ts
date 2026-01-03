// =============================================================================
// Grid Config Factory
// =============================================================================

import { DEFAULT_GRID_CONFIG, type GridSystemConfig } from '../../shared/config';
import { type GridConfig } from '../types';

/**
 * Factory responsible for creating GridConfig instances.
 * Encapsulates the logic for calculating grid geometry based on window dimensions and DPI.
 */
export class GridConfigFactory {
	/**
	 * Creates a GridConfig object based on the current window dimensions.
	 *
	 * @param window - The global Window object for accessing innerWidth/Height and devicePixelRatio.
	 * @param options - Optional partial configuration to override defaults.
	 * @returns A fully calculated GridConfig object.
	 */
	static create(window: Window, options: Partial<GridSystemConfig> = {}): GridConfig {
		const config = { ...DEFAULT_GRID_CONFIG, ...options };
		
		// Calculate physical dimensions using device pixel ratio
		const dpi = (window.devicePixelRatio || 1) * config.baseDpi;
		const cmPerPixel = 2.54 / dpi;
		const pixelsPerCm = dpi / 2.54;
		
		const screenWidthCm = window.innerWidth * cmPerPixel;
		const screenHeightCm = window.innerHeight * cmPerPixel;
		
		// Calculate the exact number of cells to fit the viewport width/height
		const cellsXPerViewport = Math.round(screenWidthCm / config.targetCellSizeCm);
		const cellsYPerViewport = Math.round(screenHeightCm / config.targetCellSizeCm);
		
		// Recalculate cell sizes to ensure a perfect fit
		const cellSizeXCm = screenWidthCm / cellsXPerViewport;
		const cellSizeYCm = screenHeightCm / cellsYPerViewport;
		
		const multiplier = config.extensionMultiplier;
		const cellsX = cellsXPerViewport * (1 + 2 * multiplier);
		const cellsY = cellsYPerViewport * (1 + 2 * multiplier);
		
		// Define grid bounds
		const minXCm = -screenWidthCm * multiplier;
		const maxXCm = screenWidthCm * (1 + multiplier);
		const minYCm = -screenHeightCm * multiplier;
		const maxYCm = screenHeightCm * (1 + multiplier);
		
		return {
			cellsX,
			cellsY,
			layers: config.layers,
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
}
