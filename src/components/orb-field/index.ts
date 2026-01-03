// =============================================================================
// Orb Field - 3D Spatial Grid System
// =============================================================================

// Core grid system
export { SpatialGrid } from './core/SpatialGrid';
export { GridConfigFactory } from './core/GridConfigFactory';
export { 
	CELL_EMPTY, 
	CELL_PROXIMITY, 
	CELL_FILLED, 
	type GridConfig, 
	type CellState 
} from './core/types';

// Configuration
export {
	DEFAULT_GRID_CONFIG,
	DEFAULT_REVEAL_CONFIG,
	DEFAULT_STYLE_CONFIG,
	type GridSystemConfig,
	type GridRevealConfig,
	type GridStyleConfig,
} from './config';

// Grid visualization
export { GridView } from './visuals/GridView';
export { GridRenderer } from './visuals/GridRenderer';
export { GridAnimator } from './visuals/GridAnimator';
