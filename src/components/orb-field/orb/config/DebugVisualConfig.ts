// =============================================================================
// Debug Visual Configuration
// =============================================================================

/**
 * Configuration for orb debug visualization.
 */
export interface OrbDebugVisualConfig {
	/** Color of the orb position indicator. */
	positionColor: string;
	/** Color of the velocity vector arrow. */
	arrowColor: string;
	/** Opacity of the velocity arrow (0-1). */
	arrowOpacity: number;
	/** Scale factor for velocity vector visualization. */
	arrowScale: number;
	/** Length of the arrowhead in pixels. */
	arrowHeadLength: number;
	/** Line width of the velocity arrow. */
	arrowLineWidth: number;
}

/**
 * Default debug visualization configuration for orbs.
 */
export const DEFAULT_ORB_DEBUG_CONFIG: OrbDebugVisualConfig = {
	positionColor: '#FFFFFF',
	arrowColor: 'rgba(255, 255, 255, 0.8)',
	arrowOpacity: 0.8,
	arrowScale: 0.5,
	arrowHeadLength: 6,
	arrowLineWidth: 1,
};
