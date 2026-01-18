// =============================================================================
// OrbVisualRenderer - Orchestrates orb rendering with depth-based effects
// =============================================================================

import { type Orb } from '../types';
import { type OrbVisualConfig, DEFAULT_ORB_VISUAL_CONFIG } from './OrbVisualConfig';
import { type WindowSize } from '../../shared/types';
import { OrbGlowRenderer } from './OrbGlowRenderer';

/**
 * Orchestrates the visual rendering of orbs.
 *
 * Single Responsibility: Coordinates orb rendering only.
 */
export class OrbVisualRenderer {
	/**
	 * Renders all orbs to the canvas with visual effects.
	 * 
	 * All orbs across ALL z-layers are rendered, sorted back-to-front.
	 * Depth affects opacity and blur but does not filter visibility.
	 * Spawn/despawn animations affect opacity and scale.
	 *
	 * @param ctx - The 2D canvas rendering context.
	 * @param windowSize - Current window dimensions.
	 * @param orbs - Array of orbs to render (from ALL layers).
	 * @param totalLayers - Total number of z-layers in the system.
	 * @param config - Visual configuration for orb appearance.
	 * @param currentTime - Current timestamp from performance.now() for animations.
	 * @param offsetX - Horizontal offset in pixels for parallax scrolling.
	 * @param offsetY - Vertical offset in pixels for parallax scrolling.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		windowSize: WindowSize,
		orbs: Orb[],
		totalLayers: number,
		config: OrbVisualConfig = DEFAULT_ORB_VISUAL_CONFIG,
		currentTime: number = performance.now(),
		offsetX: number = 0,
		offsetY: number = 0
	): void {
		const { width, height } = windowSize;

		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		// Skip if no orbs
		if (orbs.length === 0) return;

		// Sort orbs by z-depth (back to front)
		const sortedOrbs = [...orbs].sort((a, b) => b.z - a.z);

		// Apply parallax offset translation
		ctx.save();
		ctx.translate(offsetX, offsetY);

		// Use 'screen' blend mode for additive-like blending
		ctx.globalCompositeOperation = 'screen';

		// Render all orbs
		for (const orb of sortedOrbs) {
			OrbGlowRenderer.draw(ctx, orb, totalLayers, config, currentTime);
		}

		// Reset composite operation
		ctx.globalCompositeOperation = 'source-over';

		// Restore canvas state
		ctx.restore();
	}
}
