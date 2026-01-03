// =============================================================================
// Orb Types
// =============================================================================

export interface Orb {
	/** Unique identifier for the orb. */
	id: string;
	/** Pixel X position relative to the viewport. */
	pxX: number;
	/** Pixel Y position relative to the viewport. */
	pxY: number;
	/** X velocity in pixels per second. */
	vx: number;
	/** Y velocity in pixels per second. */
	vy: number;
	/** Current speed magnitude in pixels per second. */
	speed: number;
	/** Current direction angle in radians. */
	angle: number;
	/** Depth layer index (Z-axis). */
	layer: number;
	/** Diameter of the orb in grid cells. */
	size: number;
}

