"use client";

// =============================================================================
// useOrbCRUD - Orb creation and deletion operations
// =============================================================================

import { useCallback, useMemo } from 'react';
import { type Orb } from '../types';
import { OrbGridMarking } from '../core';
import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { type ViewportCells } from '../../grid/types';
import { DEFAULT_ORB_SPAWN_CONFIG, type OrbSpawnConfig } from '../config';
import { SpawnValidation } from '../../collision';
import { OrbFactory } from '../utils';

/**
 * Options for the CRUD hook.
 */
interface UseOrbCRUDOptions {
	/** Configuration for orb spawning. */
	spawnConfig?: Partial<OrbSpawnConfig>;
}

/**
 * Return values from the CRUD hook.
 */
export interface UseOrbCRUDReturn {
	/** Creates a new orb at the specified position. */
	createOrb: (pxX: number, pxY: number, z: number, size: number, grid: SpatialGrid, vpc: ViewportCells, orbsRef: React.RefObject<Orb[]>, setOrbs: (orbs: Orb[]) => void, setSelectedOrbId: (id: string) => void, selectedOrbIdRef: React.RefObject<string | null>) => void;
	/** Deletes an orb by ID. */
	deleteOrb: (id: string, grid: SpatialGrid, vpc: ViewportCells, orbsRef: React.RefObject<Orb[]>, setOrbs: (orbs: Orb[]) => void, setSelectedOrbId: (id: string | null) => void, setSelectedOrbData: (data: Orb | null) => void, selectedOrbIdRef: React.RefObject<string | null>) => void;
	/** Syncs React state with orbsRef. */
	syncOrbsState: (orbsRef: React.RefObject<Orb[]>, setOrbs: (orbs: Orb[]) => void) => void;
}

/**
 * Hook for orb CRUD operations.
 * 
 * Single Responsibility: Orb create/delete operations only.
 */
export function useOrbCRUD(options: UseOrbCRUDOptions = {}): UseOrbCRUDReturn {
	const spawnConfig = useMemo(
		() => ({ ...DEFAULT_ORB_SPAWN_CONFIG, ...options.spawnConfig }),
		[options.spawnConfig]
	);

	const createOrb = useCallback((
		pxX: number,
		pxY: number,
		z: number,
		size: number,
		grid: SpatialGrid,
		vpc: ViewportCells,
		orbsRef: React.RefObject<Orb[]>,
		setOrbs: (orbs: Orb[]) => void,
		setSelectedOrbId: (id: string) => void,
		selectedOrbIdRef: React.RefObject<string | null>
	) => {
		// Validate spawn position
		if (!SpawnValidation.canSpawn(pxX, pxY, z, size, grid, vpc)) {
			return;
		}

		// Random 3D direction
		const theta = Math.random() * Math.PI * 2;
		const phi = (Math.random() - 0.5) * Math.PI * 0.5;
		const speedRange = spawnConfig.maxSpeed - spawnConfig.minSpeed;
		const speed = spawnConfig.minSpeed + Math.random() * speedRange;

		const cosTheta = Math.cos(theta);
		const sinTheta = Math.sin(theta);
		const cosPhi = Math.cos(phi);
		const sinPhi = Math.sin(phi);

		const newOrb: Orb = OrbFactory.create({
			pxX,
			pxY,
			z,
			vx: cosTheta * cosPhi * speed,
			vy: sinTheta * cosPhi * speed,
			vz: sinPhi * speed * 0.05,
			speed,
			angle: theta,
			size,
			lifetimeMs: Infinity,
		});

		orbsRef.current.push(newOrb);
		setOrbs([...orbsRef.current]);
		setSelectedOrbId(newOrb.id);
		selectedOrbIdRef.current = newOrb.id;

		OrbGridMarking.markOrbCircular(grid, newOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
	}, [spawnConfig.minSpeed, spawnConfig.maxSpeed]);

	const deleteOrb = useCallback((
		id: string,
		grid: SpatialGrid,
		vpc: ViewportCells,
		orbsRef: React.RefObject<Orb[]>,
		setOrbs: (orbs: Orb[]) => void,
		setSelectedOrbId: (id: string | null) => void,
		setSelectedOrbData: (data: Orb | null) => void,
		selectedOrbIdRef: React.RefObject<string | null>
	) => {
		const orbToDelete = orbsRef.current.find(o => o.id === id);
		if (orbToDelete) {
			OrbGridMarking.clearOrbCircular(grid, orbToDelete, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			orbsRef.current = orbsRef.current.filter(o => o.id !== id);
			setOrbs([...orbsRef.current]);

			if (selectedOrbIdRef.current === id) {
				setSelectedOrbId(null);
				setSelectedOrbData(null);
				selectedOrbIdRef.current = null;
			}
		}
	}, []);

	const syncOrbsState = useCallback((
		orbsRef: React.RefObject<Orb[]>,
		setOrbs: (orbs: Orb[]) => void
	) => {
		setOrbs([...orbsRef.current]);
	}, []);

	return useMemo(() => ({
		createOrb,
		deleteOrb,
		syncOrbsState,
	}), [createOrb, deleteOrb, syncOrbsState]);
}
