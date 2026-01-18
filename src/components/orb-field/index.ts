// =============================================================================
// Orb Field - 3D Spatial Grid System
// =============================================================================

// ============================================================================= 
// Main Component
// =============================================================================
export { default as GridView } from './OrbField';
export { OrbField } from './OrbField';

// ============================================================================= 
// Core Grid System
// =============================================================================
export { SpatialGrid } from './grid/core/SpatialGrid';
export { GridConfigFactory } from './grid/core/GridConfigFactory';
export { ViewportCellsFactory } from './grid/core/ViewportCellsFactory';
export { type GridConfig, type ViewportCells } from './grid/types';

// Grid Visualization
export { GridRenderer } from './grid/visuals/GridRenderer';
export { GridAnimator } from './grid/visuals/GridAnimator';
export { OrbDebugOverlay } from './grid/visuals/OrbDebugOverlay';

// ============================================================================= 
// Core Orb System
// =============================================================================
export { OrbMovement, OrbGridMarking, OrbBehaviors } from './orb/core';
export { useOrbManager } from './orb/hooks/useOrbManager';
export { type Orb } from './orb/types';

// Orb Visualization
export {
	OrbVisualRenderer,
	DEFAULT_ORB_VISUAL_CONFIG,
	type OrbVisualConfig,
} from './orb/visuals';

// Orb Utilities
export {
	generateAnimationDurations,
	generateWanderParams,
	getRandomSize,
} from './orb/utils';

// =============================================================================
// Collision System
// =============================================================================
export {
	WallCollision,
	OrbOrbCollision,
	OrbAvoidance,
	MouseRepulsion,
	SpawnValidation,
	type CollisionResult,
} from './collision';

// =============================================================================
// Custom Hooks
// =============================================================================
export {
	useParallaxOffset,
	useAnimationLoop,
	useDebugStateSync,
	useEventHandlers,
	type LoopCallback,
	type DebugOptionRefs,
} from './hooks';

// =============================================================================
// Shared Types
// =============================================================================
export {
	CELL_EMPTY,
	CELL_PROXIMITY,
	CELL_FILLED,
	type CellState,
	type WindowSize,
} from './shared/types';

// =============================================================================
// Configuration
// =============================================================================
export {
	DEFAULT_GRID_CONFIG,
	DEFAULT_REVEAL_CONFIG,
	DEFAULT_STYLE_CONFIG,
	DEFAULT_ORBFIELD_CONFIG,
	DEFAULT_PARALLAX_CONFIG,
	type GridSystemConfig,
	type GridRevealConfig,
	type GridStyleConfig,
	type OrbFieldConfig,
	type ParallaxConfig,
} from './shared/config';

export {
	DEFAULT_ORB_SPAWN_CONFIG,
	DEFAULT_ORB_DEBUG_CONFIG,
	type OrbSpawnConfig,
	type OrbDebugVisualConfig,
} from './orb/config';

// =============================================================================
// Debug Components
// =============================================================================
export { OrbDebugPanel, GridDebugPanel } from './debug-info';
