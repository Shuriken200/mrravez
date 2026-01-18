"use client";

// =============================================================================
// useOrbManager - Orchestrates orb management sub-hooks
// =============================================================================

import { useRef, useState } from 'react';
import { type Orb } from '../types';
import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { type ViewportCells } from '../../grid/types';
import { type OrbSpawnConfig, type OrbBurstConfig, type ContinuousSpawnConfig } from '../config';
import { useOrbSelection } from './useOrbSelection';
import { useOrbSpawning } from './useOrbSpawning';
import { useOrbCRUD } from './useOrbCRUD';

/**
 * Options for the orb manager hook.
 */
interface UseOrbManagerOptions {
	/** Configuration for orb spawning. */
	spawnConfig?: Partial<OrbSpawnConfig>;
	/** Configuration for burst spawning. */
	burstConfig?: Partial<OrbBurstConfig>;
	/** Configuration for continuous spawning. */
	continuousConfig?: Partial<ContinuousSpawnConfig>;
}

/**
 * Return values from the orb manager hook.
 */
interface UseOrbManagerReturn {
	/** Ref to the internal orbs array for high-performance loop access. */
	orbsRef: React.MutableRefObject<Orb[]>;
	/** React state for orbs (for UI sync). */
	orbs: Orb[];
	/** Currently selected orb ID. */
	selectedOrbId: string | null;
	/** Currently selected orb data (real-time). */
	selectedOrbData: Orb | null;
	/** Ref for stable access to selected orb ID in loops. */
	selectedOrbIdRef: React.MutableRefObject<string | null>;
	/** Creates a new orb at the specified position. */
	createOrb: (pxX: number, pxY: number, layer: number, size: number, grid: SpatialGrid, vpc: ViewportCells) => void;
	/** Spawns a burst of orbs from a center point. */
	spawnOrbBurst: (centerX: number, centerY: number, grid: SpatialGrid, vpc: ViewportCells) => void;
	/** Deletes an orb by ID. */
	deleteOrb: (id: string, grid: SpatialGrid, vpc: ViewportCells) => void;
	/** Selects an orb by ID. */
	selectOrb: (id: string | null) => void;
	/** Updates the selected orb data (for real-time debug display). */
	updateSelectedOrbData: () => void;
	/** Syncs React state with orbsRef (for UI updates after direct ref modifications). */
	syncOrbsState: () => void;
	/** Spawns random orbs at random positions across the viewport. */
	spawnRandomOrbs: (count: number, screenWidth: number, screenHeight: number, grid: SpatialGrid, vpc: ViewportCells) => number;
}

/**
 * Orchestrates all orb management operations by composing focused sub-hooks.
 * 
 * Single Responsibility: Composes sub-hooks into unified API.
 */
export function useOrbManager(options: UseOrbManagerOptions = {}): UseOrbManagerReturn {
	// Shared state
	const orbsRef = useRef<Orb[]>([]);
	const [orbs, setOrbs] = useState<Orb[]>([]);

	// Sub-hooks
	const selection = useOrbSelection();
	const spawning = useOrbSpawning({
		burstConfig: options.burstConfig,
		continuousConfig: options.continuousConfig,
	});
	const crud = useOrbCRUD({
		spawnConfig: options.spawnConfig,
	});

	// Wrapper functions that pass shared state to sub-hooks
	const createOrb = (pxX: number, pxY: number, z: number, size: number, grid: SpatialGrid, vpc: ViewportCells) => {
		const setSelectedOrbId = (id: string) => {
			selection.selectOrb(id, orbsRef);
		};
		crud.createOrb(pxX, pxY, z, size, grid, vpc, orbsRef, setOrbs, setSelectedOrbId, selection.selectedOrbIdRef);
	};

	const deleteOrb = (id: string, grid: SpatialGrid, vpc: ViewportCells) => {
		const setSelectedOrbIdWrapper = (id: string | null) => {
			selection.selectOrb(id, orbsRef);
		};
		const setSelectedOrbDataWrapper = (_data: Orb | null) => {
			// This is handled internally by selectOrb
		};
		crud.deleteOrb(id, grid, vpc, orbsRef, setOrbs, setSelectedOrbIdWrapper, setSelectedOrbDataWrapper, selection.selectedOrbIdRef);
	};

	const spawnOrbBurst = (centerX: number, centerY: number, grid: SpatialGrid, vpc: ViewportCells) => {
		spawning.spawnOrbBurst(centerX, centerY, grid, vpc, orbsRef, setOrbs);
	};

	const spawnRandomOrbs = (count: number, screenWidth: number, screenHeight: number, grid: SpatialGrid, vpc: ViewportCells): number => {
		return spawning.spawnRandomOrbs(count, screenWidth, screenHeight, grid, vpc, orbsRef, setOrbs);
	};

	const selectOrb = (id: string | null) => {
		selection.selectOrb(id, orbsRef);
	};

	const updateSelectedOrbData = () => {
		selection.updateSelectedOrbData(orbsRef);
	};

	const syncOrbsState = () => {
		crud.syncOrbsState(orbsRef, setOrbs);
	};

	return {
		orbsRef,
		orbs,
		selectedOrbId: selection.selectedOrbId,
		selectedOrbData: selection.selectedOrbData,
		selectedOrbIdRef: selection.selectedOrbIdRef,
		createOrb,
		spawnOrbBurst,
		spawnRandomOrbs,
		deleteOrb,
		selectOrb,
		updateSelectedOrbData,
		syncOrbsState,
	};
}
