"use client";

import { greetingConfig } from "./greetingConfig";
import { calculateAnimationStates, calculateHiStyles, calculateWelcomeStyles } from "./greetingStyles";

interface GreetingSectionProps {
	stage: number;
	theme: "light" | "dark";
}

/**
 * The "Hi!" greeting and welcome text that appear on initial load
 * Stage-based animation sequence:
 * - Stage 0: Hidden
 * - Stage 1: Hi! emerging (growing from tiny)
 * - Stage 2: Hi! popped (burst)
 * - Stage 3: Hi! fading out
 * - Stage 4: Hi! fully gone, Welcome starts appearing
 * - Stage 5: Welcome fully visible
 * - Stage 6: Welcome starts fading out
 * - Stage 7: Welcome fully gone, about card appears
 * 
 * Refactored to use:
 * - greetingConfig for text and timing
 * - Pure style calculation functions
 */
export function GreetingSection({ stage, theme }: GreetingSectionProps) {
	// Don't render anything after the intro sequence is fully complete
	if (stage >= 7) {
		return null;
	}

	const states = calculateAnimationStates(stage);
	const hiStyle = calculateHiStyles(states, theme);
	const welcomeStyle = calculateWelcomeStyles(states, theme);

	return (
		<>
			<style jsx>{`
				.greeting-wrapper {
					position: absolute;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					z-index: 10;
				}
			`}</style>

			{/* "Hi!" greeting - visible until stage 4 (fully faded at stage 3->4) */}
			{!states.isHiGone && (
				<div className="greeting-wrapper">
					<h1 style={hiStyle}>{greetingConfig.hiText}</h1>
				</div>
			)}

			{/* "Welcome..." text - visible from stage 4 to 7, fades out at stage 6 */}
			{states.isWelcomeAppearing && (
				<div className="greeting-wrapper">
					<p style={welcomeStyle}>{greetingConfig.welcomeText}</p>
				</div>
			)}
		</>
	);
}
