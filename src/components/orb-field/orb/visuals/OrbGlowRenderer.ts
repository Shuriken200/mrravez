// =============================================================================
// OrbGlowRenderer - Renders individual orb glow with depth effects
// =============================================================================

import { type Orb } from '../types';
import { type OrbVisualConfig } from './OrbVisualConfig';
import { OrbGradientFactory } from './OrbGradientFactory';
import { OrbAnimationTiming } from './OrbAnimationTiming';

/**
 * Handles rendering of individual orbs with glow effects.
 * 
 * Single Responsibility: Orb drawing logic only.
 */
export class OrbGlowRenderer {
	/**
	 * Draws a single orb with radial gradient for glow and depth blur effect.
	 * Uses Gaussian-like exponential decay for soft, natural-looking edges.
	 * Applies spawn/despawn animation for smooth fade-in/out and scale effects.
	 *
	 * @param ctx - The 2D canvas rendering context.
	 * @param orb - The orb to render.
	 * @param totalLayers - Total number of z-layers.
	 * @param config - Visual configuration.
	 * @param currentTime - Current timestamp for animation calculations.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		orb: Orb,
		totalLayers: number,
		config: OrbVisualConfig,
		currentTime: number
	): void {
		const { pxX, pxY, z, size } = orb;

		// Skip orbs with invalid positions
		if (!isFinite(pxX) || !isFinite(pxY) || !isFinite(z) || !isFinite(size) || size <= 0) {
			return;
		}

		// Calculate animation factor
		const animationFactor = OrbAnimationTiming.calculateAnimationFactor(orb, currentTime, config);

		// Skip if fully invisible or invalid
		if (animationFactor <= 0 || !isFinite(animationFactor)) return;

		// Calculate depth factor
		const depthFactor = OrbAnimationTiming.calculateDepthFactor(z, totalLayers);

		// Calculate orb visual radius
		const baseRadius = config.baseRadiusPx * Math.pow(size, config.sizeExponent);

		// Calculate blur width
		const blurWidth = baseRadius * (config.blurWidthBase + depthFactor * config.blurWidthDepthScale);

		// Total glow radius with animation scale
		let glowRadius = (baseRadius * config.coreRatio + blurWidth) * config.glowSpread;
		const scaleFactor = this.lerp(config.animationMinScale, 1, animationFactor);
		glowRadius *= scaleFactor;

		// Skip if radius is too small
		if (glowRadius < 0.5 || !isFinite(glowRadius)) return;

		// Calculate depth-based opacity
		const baseOpacity = this.lerp(config.maxOpacity, config.minOpacity, depthFactor);
		const opacity = baseOpacity * animationFactor;

		// Calculate depth-based falloff exponent
		const falloffExponent = config.falloffExponentBase * (1 - depthFactor * config.falloffDepthScale);

		// Create and apply gradient
		const gradient = OrbGradientFactory.createGaussian(
			ctx,
			pxX,
			pxY,
			glowRadius,
			falloffExponent,
			opacity,
			config
		);

		// Draw the orb
		ctx.beginPath();
		ctx.arc(pxX, pxY, glowRadius, 0, Math.PI * 2);
		ctx.fillStyle = gradient;
		ctx.fill();
	}

	/**
	 * Linear interpolation between two values.
	 */
	private static lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}
