// =============================================================================
// Orb Field - 3D Spatial Grid System
// =============================================================================

// Core grid system
export { SpatialGrid } from './grid/core/SpatialGrid';
export { GridConfigFactory } from './grid/core/GridConfigFactory';
export { OrbPhysics } from './orb/core/OrbPhysics';
export { 
	CELL_EMPTY, 
	CELL_PROXIMITY, 
	CELL_FILLED, 
	type CellState 
} from './shared/types';
export { type GridConfig } from './grid/types';

// Configuration
export {
	DEFAULT_GRID_CONFIG,
	DEFAULT_REVEAL_CONFIG,
	DEFAULT_STYLE_CONFIG,
	type GridSystemConfig,
	type GridRevealConfig,
	type GridStyleConfig,
} from './shared/config';

// Grid visualization
export { default as GridView } from './OrbField';
export { GridRenderer } from './grid/visuals/GridRenderer';
export { GridAnimator } from './grid/visuals/GridAnimator';

// Debugging
export { OrbDebugPanel } from './debug-info/components/OrbDebugPanel';
export { GridDebugPanel } from './debug-info/components/GridDebugPanel';
