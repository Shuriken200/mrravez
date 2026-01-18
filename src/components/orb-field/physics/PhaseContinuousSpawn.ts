// =============================================================================
// PhaseContinuousSpawn - Phase 10: Continuous orb spawning
// =============================================================================

import { DEFAULT_CONTINUOUS_SPAWN_CONFIG } from '../orb/config';
import { type WindowSize } from '../shared/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';

/**
 * Phase 10: Continuous orb spawning to maintain target count.
 * 
 * Single Responsibility: Spawning new orbs only.
 */
export class PhaseContinuousSpawn {
	/**
	 * Spawns new orbs to maintain target count.
	 * 
	 * @param orbsRef - Ref to orbs array (for reading count).
	 * @param grid - Spatial grid for spawn validation.
	 * @param vpc - Viewport cells for coordinate conversion.
	 * @param windowSize - Current window dimensions.
	 * @param currentTime - Current effective time.
	 * @param burstTime - Time when burst occurred (or null).
	 * @param isPageVisible - Whether page is visible and focused.
	 * @param enableOrbSpawning - Whether continuous spawning is enabled.
	 * @param spawnRandomOrbs - Function to spawn random orbs.
	 * @param deltaTime - Time since last frame in seconds.
	 */
	static execute(
		orbsRef: React.RefObject<Orb[]>,
		grid: SpatialGrid,
		vpc: ViewportCells,
		windowSize: WindowSize,
		currentTime: number,
		burstTime: number | null,
		isPageVisible: boolean,
		enableOrbSpawning: boolean,
		spawnRandomOrbs: (count: number, screenWidth: number, screenHeight: number, grid: SpatialGrid, vpc: ViewportCells) => number,
		deltaTime: number
	): void {
		const { delayAfterBurstMs, targetOrbCountAt4K, referenceScreenArea, minOrbCount, baseSpawnRateAt4K, maxSpawnsPerFrame } = DEFAULT_CONTINUOUS_SPAWN_CONFIG;

		if (!burstTime || (currentTime - burstTime) <= delayAfterBurstMs || !isPageVisible || !enableOrbSpawning) {
			return;
		}

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

			// Calculate spawns based on actual time delta
			const expectedSpawns = spawnRate * deltaTime;
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
