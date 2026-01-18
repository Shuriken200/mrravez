"use client";

// =============================================================================
// useGridInitialization - Grid setup and initialization
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { GridConfigFactory } from '../grid/core/GridConfigFactory';
import { ViewportCellsFactory } from '../grid/core/ViewportCellsFactory';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type GridConfig, type ViewportCells } from '../grid/types';
import { type WindowSize } from '../shared/types';

/**
 * Parameters for the grid initialization hook.
 */
interface UseGridInitializationParams {
	windowSize: WindowSize;
	isMobile: boolean;
}

/**
 * Return values from the grid initialization hook.
 */
export interface UseGridInitializationReturn {
	gridConfig: GridConfig | null;
	viewportCells: ViewportCells | null;
	gridRef: React.RefObject<SpatialGrid | null>;
	viewportCellsRef: React.RefObject<ViewportCells | null>;
}

/**
 * Handles grid configuration, creation, and viewport cell calculation.
 * 
 * Single Responsibility: Grid initialization only.
 */
export function useGridInitialization(params: UseGridInitializationParams): UseGridInitializationReturn {
	const { windowSize, isMobile } = params;

	const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
	const [viewportCells, setViewportCells] = useState<ViewportCells | null>(null);
	const gridRef = useRef<SpatialGrid | null>(null);
	const viewportCellsRef = useRef<ViewportCells | null>(null);

	// Extract primitive values from windowSize to avoid object identity issues
	const windowWidth = windowSize.width;
	const windowHeight = windowSize.height;

	useEffect(() => {
		if (windowWidth === 0) return;

		console.log('[useGridInitialization] Creating new grid for window:', windowWidth, windowHeight);

		const config = GridConfigFactory.create(window, {
			targetCellSizeCm: isMobile ? 0.25 : 0.5,
		});
		const newGrid = new SpatialGrid(config);
		newGrid.initializeBorder();
		const vpc = ViewportCellsFactory.create(config);

		gridRef.current = newGrid;
		viewportCellsRef.current = vpc;

		queueMicrotask(() => {
			setGridConfig(config);
			setViewportCells(vpc);
		});
	}, [windowWidth, windowHeight, isMobile]);

	return {
		gridConfig,
		viewportCells,
		gridRef,
		viewportCellsRef,
	};
}
