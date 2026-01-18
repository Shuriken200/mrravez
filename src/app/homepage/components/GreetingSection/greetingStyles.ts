/**
 * Pure style calculation functions for greeting section
 * Separates style logic from component rendering
 */

import { greetingConfig } from "./greetingConfig";

export interface AnimationStates {
	isHiEmerging: boolean;
	isHiPopped: boolean;
	isHiFadingOut: boolean;
	isHiGone: boolean;
	isWelcomeAppearing: boolean;
	isWelcomeFullyVisible: boolean;
	isWelcomeFadingOut: boolean;
}

/**
 * Calculate animation states based on stage
 */
export function calculateAnimationStates(stage: number): AnimationStates {
	return {
		isHiEmerging: stage >= 1,
		isHiPopped: stage >= 2,
		isHiFadingOut: stage >= 3,
		isHiGone: stage >= 4,
		isWelcomeAppearing: stage >= 4,
		isWelcomeFullyVisible: stage >= 5,
		isWelcomeFadingOut: stage >= 6,
	};
}

/**
 * Calculate Hi! text styles based on animation state and theme
 */
export function calculateHiStyles(states: AnimationStates, theme: "light" | "dark"): React.CSSProperties {
	const config = greetingConfig;

	return {
		fontSize: config.hiFontSize,
		fontWeight: config.hiFontWeight,
		letterSpacing: "-0.04em",
		margin: 0,
		position: "relative",
		zIndex: 10,
		userSelect: "none",
		WebkitUserSelect: "none",
		pointerEvents: "none",
		// Opacity: visible during emerging/popped, fade out at stage 3
		opacity: states.isHiFadingOut ? 0 : states.isHiEmerging ? 1 : 0,
		// Scale: tiny -> 0.85 -> 1.0
		transform: states.isHiPopped ? "scale(1)" : states.isHiEmerging ? "scale(0.85)" : "scale(0.01)",
		// Color: black -> gray -> white (burst)
		color: states.isHiPopped
			? theme === "light"
				? config.hiColorLightBurst
				: config.hiColorDarkBurst
			: states.isHiEmerging
				? config.hiColorEmerging
				: "#000000",
		textShadow: states.isHiPopped
			? config.hiTextShadowPopped
			: states.isHiEmerging
				? config.hiTextShadowEmerging
				: "none",
		// Transition timing
		transition: states.isHiFadingOut
			? config.hiFadeOutTransition
			: states.isHiPopped
				? config.hiPoppedTransition
				: config.hiEmergingTransition,
	};
}

/**
 * Calculate Welcome text styles based on animation state and theme
 */
export function calculateWelcomeStyles(states: AnimationStates, theme: "light" | "dark"): React.CSSProperties {
	const config = greetingConfig;

	return {
		fontSize: config.welcomeFontSize,
		fontWeight: config.welcomeFontWeight,
		color: theme === "light" ? config.hiColorLightBurst : config.hiColorDarkBurst,
		margin: 0,
		userSelect: "none",
		WebkitUserSelect: "none",
		pointerEvents: "none",
		textAlign: "center",
		maxWidth: "90vw",
		// Animation: fade in at stage 5, fade out at stage 6 (slower fade)
		opacity: states.isWelcomeFadingOut ? 0 : states.isWelcomeFullyVisible ? 1 : 0,
		transition: config.welcomeTransition,
	};
}
