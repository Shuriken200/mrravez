// =============================================================================
// PhaseLifecycle - Phase 9-10: Orb expiration and continuous spawning
// =============================================================================

import { type Orb } from '../orb/types';
import { OrbGridMarking } from '../orb/core';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { DEFAULT_CONTINUOUS_SPAWN_CONFIG } from '../orb/config';
import { type WindowSize } from '../shared/types';

/**
 * Phase 9-10: Orb lifecycle management (expiration and spawning).
 * 
 * Single Responsibility: Orb lifecycle events only.
 */
export class PhaseLifecycle {
	/**
	 * Removes expired orbs and spawns new orbs to maintain target count.
	 * 
	 * @param orbsRef - Ref to orbs array (mutated in place).
	 * @param grid - Spatial grid for clearing expired orbs.
	 * @param vpc - Viewport cells for coordinate conversion.
	 * @param windowSize - Current window dimensions.
	 * @param currentTime - Current effective time.
	 * @param burstTime - Time when burst occurred (or null).
	 * @param isPageVisible - Whether page is visible and focused.
	 * @param enableOrbDespawning - Whether orb despawning is enabled.
	 * @param enableOrbSpawning - Whether continuous spawning is enabled.
	 * @param spawnRandomOrbs - Function to spawn random orbs.
	 * @param syncOrbsState - Function to sync React state.
	 */
	static execute(
		orbsRef: React.MutableRefObject<Orb[]>,
		grid: SpatialGrid,
		vpc: ViewportCells,
		windowSize: WindowSize,
		currentTime: number,
		burstTime: number | null,
		isPageVisible: boolean,
		enableOrbDespawning: boolean,
		enableOrbSpawning: boolean,
		spawnRandomOrbs: (count: number, screenWidth: number, screenHeight: number, grid: SpatialGrid, vpc: ViewportCells) => number,
		syncOrbsState: () => void
	): void {
		// Phase 9: Remove expired orbs
		if (enableOrbDespawning) {
			const currentOrbs = orbsRef.current;
			const expiredOrbs = currentOrbs.filter(orb => (currentTime - orb.createdAt) > orb.lifetimeMs);
			if (expiredOrbs.length > 0) {
				for (const expiredOrb of expiredOrbs) {
					OrbGridMarking.clearOrbCircular(grid, expiredOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
				}
				orbsRef.current = currentOrbs.filter(orb => (currentTime - orb.createdAt) <= orb.lifetimeMs);
				syncOrbsState();
			}
		}

		// Phase 10: Continuous spawning
		const { delayAfterBurstMs, targetOrbCountAt4K, referenceScreenArea, minOrbCount, baseSpawnRateAt4K, maxSpawnsPerFrame } = DEFAULT_CONTINUOUS_SPAWN_CONFIG;
		if (burstTime && (currentTime - burstTime) > delayAfterBurstMs && isPageVisible && enableOrbSpawning) {
			const screenArea = windowSize.width * windowSize.height;
			const areaScale = screenArea / referenceScreenArea;
			const scaledCount = Math.round(targetOrbCountAt4K * areaScale);
			const targetCount = Math.max(minOrbCount, scaledCount);
			const baseSpawnRate = baseSpawnRateAt4K * areaScale;

			const currentCount = orbsRef.current.length;
			const deficit = targetCount - currentCount;

			if (deficit > 0) {
				const deficitRatio = Math.min(1, deficit / targetCount);
				const spawnRate = baseSpawnRate * deficitRatio;
				
				// Calculate spawns based on time delta
				// Note: deltaTime would need to be passed in, but we can approximate with frame rate
				const assumedDeltaTime = 1 / 60; // Assume 60 FPS
				const expectedSpawns = spawnRate * assumedDeltaTime;
				const guaranteedSpawns = Math.floor(expectedSpawns);
				const fractionalChance = expectedSpawns - guaranteedSpawns;
				const extraSpawn = Math.random() < fractionalChance ? 1 : 0;
				const spawnsThisFrame = Math.min(guaranteedSpawns + extraSpawn, maxSpawnsPerFrame);

				if (spawnsThisFrame > 0) {
					spawnRandomOrbs(spawnsThisFrame, windowSize.width, windowSize.height, grid, vpc);
				}
			}
		}
	}
}
