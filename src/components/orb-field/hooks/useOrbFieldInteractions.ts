"use client";

// =============================================================================
// useOrbFieldInteractions - OrbField user interaction handlers
// =============================================================================

import { useCallback, useState, useRef } from 'react';
import { type GridConfig, type ViewportCells } from '../grid/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';

/**
 * Parameters for the interaction handlers hook.
 */
interface UseOrbFieldInteractionsParams {
	gridConfig: GridConfig | null;
	viewportCellsRef: React.MutableRefObject<ViewportCells | null>;
	gridRef: React.MutableRefObject<SpatialGrid | null>;
	currentLayerRef: React.MutableRefObject<number>;
	orbSize: number;
	isDebugMode: boolean;
	currentScrollOffsetRef: React.MutableRefObject<{ x: number; y: number }>;
	enableSpawnOnClickRef: React.MutableRefObject<boolean>;
	createOrb: (pxX: number, pxY: number, layer: number, size: number, grid: SpatialGrid, vpc: ViewportCells) => void;
	deleteOrb: (id: string, grid: SpatialGrid, vpc: ViewportCells) => void;
}

/**
 * Return values from the interaction handlers hook.
 */
export interface UseOrbFieldInteractionsReturn {
	hoveredCell: { x: number; y: number; worldX: number; worldY: number } | null;
	hoveredCellRef: React.MutableRefObject<{ x: number; y: number; worldX: number; worldY: number } | null>;
	handleMouseMove: (e: React.MouseEvent) => void;
	handleClick: (e: React.MouseEvent) => void;
	handleMouseLeave: () => void;
	handleTouchStart: (e: React.TouchEvent) => void;
	handleTouchMove: (e: React.TouchEvent) => void;
	handleTouchEnd: () => void;
	handleDeleteOrb: (id: string) => void;
}

/**
 * Manages all user interaction handlers for OrbField.
 * 
 * Single Responsibility: User interaction handling only.
 */
export function useOrbFieldInteractions(params: UseOrbFieldInteractionsParams): UseOrbFieldInteractionsReturn {
	const {
		gridConfig,
		viewportCellsRef,
		gridRef,
		currentLayerRef,
		orbSize,
		isDebugMode,
		currentScrollOffsetRef,
		enableSpawnOnClickRef,
		createOrb,
		deleteOrb,
	} = params;

	const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
	const hoveredCellRef = useRef<{ x: number; y: number; worldX: number; worldY: number } | null>(null);

	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		const vpc = viewportCellsRef.current;
		const gc = gridConfig;
		if (!vpc || !gc || !isDebugMode) return;

		const adjustedX = e.clientX - currentScrollOffsetRef.current.x;
		const adjustedY = e.clientY - currentScrollOffsetRef.current.y;
		const cellX = vpc.startCellX + Math.floor(adjustedX / vpc.cellSizeXPx);
		const cellY = vpc.startCellY + Math.floor(adjustedY / vpc.cellSizeYPx);

		const cellInfo = {
			x: cellX,
			y: cellY,
			worldX: gc.minXCm + cellX * vpc.cellSizeXCm,
			worldY: gc.minYCm + cellY * vpc.cellSizeYCm,
		};

		hoveredCellRef.current = cellInfo;
		setHoveredCell(cellInfo);
	}, [gridConfig, isDebugMode, currentScrollOffsetRef, viewportCellsRef]);

	const handleClick = useCallback((e: React.MouseEvent) => {
		const vpc = viewportCellsRef.current;
		const grid = gridRef.current;
		if (!grid || !vpc || !isDebugMode || !enableSpawnOnClickRef.current) return;

		const adjustedX = e.clientX - currentScrollOffsetRef.current.x;
		const adjustedY = e.clientY - currentScrollOffsetRef.current.y;
		createOrb(adjustedX, adjustedY, currentLayerRef.current, orbSize, grid, vpc);
	}, [orbSize, createOrb, isDebugMode, currentScrollOffsetRef, enableSpawnOnClickRef, viewportCellsRef, gridRef, currentLayerRef]);

	const handleDeleteOrb = useCallback((id: string) => {
		const grid = gridRef.current;
		const vpc = viewportCellsRef.current;
		if (!grid || !vpc) return;
		deleteOrb(id, grid, vpc);
	}, [deleteOrb, gridRef, viewportCellsRef]);

	const handleMouseLeave = useCallback(() => {
		hoveredCellRef.current = null;
		setHoveredCell(null);
	}, []);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		const vpc = viewportCellsRef.current;
		const grid = gridRef.current;
		if (!grid || !vpc || !isDebugMode) return;

		if (e.touches.length > 0) {
			const touch = e.touches[0];
			const adjustedX = touch.clientX - currentScrollOffsetRef.current.x;
			const adjustedY = touch.clientY - currentScrollOffsetRef.current.y;

			if (gridConfig) {
				const cellX = vpc.startCellX + Math.floor(adjustedX / vpc.cellSizeXPx);
				const cellY = vpc.startCellY + Math.floor(adjustedY / vpc.cellSizeYPx);
				const cellInfo = {
					x: cellX,
					y: cellY,
					worldX: gridConfig.minXCm + cellX * vpc.cellSizeXCm,
					worldY: gridConfig.minYCm + cellY * vpc.cellSizeYCm,
				};
				hoveredCellRef.current = cellInfo;
				setHoveredCell(cellInfo);
			}

			if (enableSpawnOnClickRef.current) {
				createOrb(adjustedX, adjustedY, currentLayerRef.current, orbSize, grid, vpc);
			}
		}
	}, [orbSize, createOrb, isDebugMode, gridConfig, currentScrollOffsetRef, enableSpawnOnClickRef, viewportCellsRef, gridRef, currentLayerRef]);

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		const vpc = viewportCellsRef.current;
		const gc = gridConfig;
		if (!vpc || !gc || !isDebugMode) return;

		if (e.touches.length > 0) {
			const touch = e.touches[0];
			const adjustedX = touch.clientX - currentScrollOffsetRef.current.x;
			const adjustedY = touch.clientY - currentScrollOffsetRef.current.y;
			const cellX = vpc.startCellX + Math.floor(adjustedX / vpc.cellSizeXPx);
			const cellY = vpc.startCellY + Math.floor(adjustedY / vpc.cellSizeYPx);
			const cellInfo = {
				x: cellX,
				y: cellY,
				worldX: gc.minXCm + cellX * vpc.cellSizeXCm,
				worldY: gc.minYCm + cellY * vpc.cellSizeYCm,
			};
			hoveredCellRef.current = cellInfo;
			setHoveredCell(cellInfo);
		}
	}, [gridConfig, isDebugMode, currentScrollOffsetRef, viewportCellsRef]);

	const handleTouchEnd = useCallback(() => {
		hoveredCellRef.current = null;
		setHoveredCell(null);
	}, []);

	return {
		hoveredCell,
		hoveredCellRef,
		handleMouseMove,
		handleClick,
		handleMouseLeave,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleDeleteOrb,
	};
}
