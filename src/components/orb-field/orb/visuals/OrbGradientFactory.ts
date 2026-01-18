// =============================================================================
// OrbGradientFactory - Creates radial gradients for orb rendering
// =============================================================================

import { type OrbVisualConfig } from './OrbVisualConfig';

/**
 * Factory for creating orb visual gradients.
 * 
 * Single Responsibility: Gradient creation only.
 */
export class OrbGradientFactory {
	/**
	 * Creates a radial gradient with Gaussian-like exponential decay.
	 * 
	 * Uses the formula: opacity = e^(-(t/sigma)^exponent)
	 * Where t is the normalized distance from center (0-1).
	 * 
	 * @param ctx - The 2D canvas rendering context.
	 * @param x - Center X position.
	 * @param y - Center Y position.
	 * @param glowRadius - The total radius including glow.
	 * @param falloffExponent - Controls curve steepness (higher = sharper).
	 * @param opacity - Overall opacity of the orb.
	 * @param config - Visual configuration.
	 * @returns A radial gradient for filling the orb.
	 */
	static createGaussian(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		glowRadius: number,
		falloffExponent: number,
		opacity: number,
		config: OrbVisualConfig
	): CanvasGradient {
		const { baseHue, baseSaturation, baseLightness, glowIntensity, gradientStopCount, coreRatio } = config;

		const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);

		// Sigma controls the width of the Gaussian curve
		const sigma = 0.4;

		const coreLightness = Math.min(baseLightness + 35, 55);
		const glowLightness = baseLightness;

		// Generate gradient stops using Gaussian-like falloff
		for (let i = 0; i <= gradientStopCount; i++) {
			const t = i / gradientStopCount;

			// Gaussian-like opacity falloff
			const gaussianFactor = Math.exp(-Math.pow(t / sigma, falloffExponent));
			const stopOpacity = opacity * gaussianFactor * glowIntensity;

			// Interpolate lightness
			const lightnessT = Math.max(0, (t - coreRatio) / (1 - coreRatio));
			const lightness = this.lerp(coreLightness, glowLightness, Math.pow(lightnessT, 0.5));

			const color = `hsla(${baseHue}, ${baseSaturation}%, ${lightness}%, ${stopOpacity})`;
			gradient.addColorStop(t, color);
		}

		return gradient;
	}

	/**
	 * Linear interpolation between two values.
	 */
	private static lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}
