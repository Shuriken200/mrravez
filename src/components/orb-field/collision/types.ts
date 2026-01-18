// =============================================================================
// Collision Types - Shared interfaces for collision detection
// =============================================================================

/**
 * Result of a 3D collision check containing blocking status and reflection axes.
 */
export interface CollisionResult {
	/** Whether any collision was detected. */
	blocked: boolean;
	/** Whether to reflect velocity on the X-axis. */
	reflectX: boolean;
	/** Whether to reflect velocity on the Y-axis. */
	reflectY: boolean;
	/** Whether to reflect velocity on the Z-axis. */
	reflectZ: boolean;
}
