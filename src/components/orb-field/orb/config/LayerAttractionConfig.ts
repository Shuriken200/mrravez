// =============================================================================
// Layer Attraction Configuration
// =============================================================================

/**
 * Configuration for orb layer attraction behavior.
 */
export interface OrbLayerAttractionConfig {
	/** Strength of attraction toward preferred layer (very low for gentle drift). */
	attractionStrength: number;
}

/**
 * Default layer attraction configuration for orbs.
 * Orbs are gently pulled toward their preferred Z-layer based on size.
 */
export const DEFAULT_LAYER_ATTRACTION_CONFIG: OrbLayerAttractionConfig = {
	attractionStrength: 0.5, // Very gentle - units are layers/s² acceleration
};
