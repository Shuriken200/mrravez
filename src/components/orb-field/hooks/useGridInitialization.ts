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
	gridRef: React.MutableRefObject<SpatialGrid | null>;
	viewportCellsRef: React.MutableRefObject<ViewportCells | null>;
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

	useEffect(() => {
		if (windowSize.width === 0) return;

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
	}, [windowSize, isMobile]);

	return {
		gridConfig,
		viewportCells,
		gridRef,
		viewportCellsRef,
	};
}
