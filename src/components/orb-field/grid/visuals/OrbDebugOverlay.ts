// =============================================================================
// OrbDebugOverlay - Debug visualization for orbs
// =============================================================================

import { type Orb } from '../../orb/types';
import { DEFAULT_ORB_DEBUG_CONFIG, type OrbDebugVisualConfig } from '../../orb/config';

/**
 * Handles rendering debug overlays for orbs (position indicators and velocity vectors).
 * 
 * Single Responsibility: Only draws debug visuals for orbs.
 * Separated from GridRenderer following Interface Segregation Principle.
 */
export class OrbDebugOverlay {
	/**
	 * Draws debug visuals for orbs (position indicator and velocity vector).
	 * 
	 * @param ctx - The 2D canvas rendering context.
	 * @param orbs - Array of orbs to render debug visuals for.
	 * @param currentLayer - Currently visible depth layer (unused, kept for future).
	 * @param config - Debug visualization configuration.
	 * @param showArrowVector - Whether to show velocity arrow vectors.
	 * @param showTruePosition - Whether to show true position indicator dot.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		orbs: Orb[],
		currentLayer: number,
		config: OrbDebugVisualConfig = DEFAULT_ORB_DEBUG_CONFIG,
		showArrowVector: boolean = true,
		showTruePosition: boolean = true
	): void {
		for (const orb of orbs) {
			// Show all orbs regardless of layer (they move in 3D)
			// Opacity could be adjusted based on z-distance in the future

			// Draw position indicator (1x1 pixel) - only if enabled
			if (showTruePosition) {
				ctx.fillStyle = config.positionColor;
				ctx.fillRect(orb.pxX, orb.pxY, 1, 1);
			}

			// Draw velocity vector arrow (only if enabled)
			if (showArrowVector) {
				const speed = Math.sqrt(orb.vx * orb.vx + orb.vy * orb.vy);
				if (speed > 0) {
					const endX = orb.pxX + orb.vx * config.arrowScale;
					const endY = orb.pxY + orb.vy * config.arrowScale;

					ctx.strokeStyle = config.arrowColor;
					ctx.lineWidth = config.arrowLineWidth;
					ctx.beginPath();
					ctx.moveTo(orb.pxX, orb.pxY);
					ctx.lineTo(endX, endY);

					// Draw arrowhead
					const angle = Math.atan2(orb.vy, orb.vx);
					const headLen = config.arrowHeadLength;
					const headAngle = Math.PI / 6;

					ctx.lineTo(
						endX - headLen * Math.cos(angle - headAngle),
						endY - headLen * Math.sin(angle - headAngle)
					);
					ctx.moveTo(endX, endY);
					ctx.lineTo(
						endX - headLen * Math.cos(angle + headAngle),
						endY - headLen * Math.sin(angle + headAngle)
					);
					ctx.stroke();
				}
			}
		}
	}
}
