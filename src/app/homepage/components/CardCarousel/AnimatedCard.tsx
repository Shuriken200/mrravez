/**
 * Wrapper component that applies GlassCard with animation props
 * Cards only handle content, this handles all animation/transition logic
 */

import { GlassCard } from "@/components/glass";
import type { SectionVisibility } from "../../types";

// Shared card wrapper styles
const cardWrapperStyle: React.CSSProperties = {
	position: "fixed",
	top: "50%",
	left: "50%",
	zIndex: 10,
	maxWidth: "480px",
	width: "calc(100% - 32px)",
};

export interface AnimatedCardProps {
	children: React.ReactNode;
	visibility: SectionVisibility;
	padding: string;
	mobilePadding: string;
	mobileBorderRadius: number;
	ariaLabel: string;
}

/**
 * Animated card wrapper that integrates with GlassCard
 * Handles all animation/transition logic via props
 */
export function AnimatedCard({
	children,
	visibility,
	padding,
	mobilePadding,
	mobileBorderRadius,
	ariaLabel,
}: AnimatedCardProps) {
	return (
		<GlassCard
			style={cardWrapperStyle}
			padding={padding}
			borderRadius={60}
			mobileBorderRadius={mobileBorderRadius}
			mobilePadding={mobilePadding}
			opacity={visibility.opacity}
			entryProgress={visibility.entryProgress}
			exitProgress={visibility.exitProgress}
			mobileOffset={visibility.mobileOffset}
			mobileScale={visibility.mobileScale}
			wheelRotateY={visibility.wheelRotateY}
			wheelTranslateX={visibility.wheelTranslateX}
			wheelTranslateZ={visibility.wheelTranslateZ}
			ariaLabel={ariaLabel}
		>
			{children}
		</GlassCard>
	);
}
