// =============================================================================
// Grid Animator
// =============================================================================

/**
 * Manages the animation loop for the grid reveal effect.
 * Handles the requestAnimationFrame loop and calculates progress with easing.
 */
export class GridAnimator {
	private animationId: number | null = null;
	private startTime: number | null = null;
	private isRunning: boolean = false;
	
	/**
	 * @param duration - Duration of the animation in milliseconds.
	 * @param onUpdate - Callback fired on every frame with raw (linear) and eased progress (0 to 1).
	 * @param onComplete - Optional callback fired when the animation completes.
	 */
	constructor(
		private duration: number,
		private onUpdate: (progress: number, eased: number) => void,
		private onComplete?: () => void
	) {}
	
	/**
	 * Starts the animation loop.
	 */
	start() {
		if (this.isRunning) return;
		this.isRunning = true;
		this.startTime = null;
		this.animationId = requestAnimationFrame(this.animate);
	}
	
	/**
	 * Stops the animation loop immediately.
	 */
	stop() {
		this.isRunning = false;
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}
	
	/**
	 * Internal animation frame handler.
	 */
	private animate = (timestamp: number) => {
		if (!this.isRunning) return;
		
		if (this.startTime === null) {
			this.startTime = timestamp;
		}
		
		const elapsed = timestamp - this.startTime;
		const progress = Math.min(1, elapsed / this.duration);
		
		// Easing function: Cubic ease-out
		const eased = 1 - Math.pow(1 - progress, 3);
		
		this.onUpdate(progress, eased);
		
		if (progress < 1) {
			this.animationId = requestAnimationFrame(this.animate);
		} else {
			this.isRunning = false;
			this.onComplete?.();
		}
	};
}
