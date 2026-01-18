"use client";

import { useRef, useMemo } from "react";
import { cardsConfig } from "@/config/cards.config";
import type { AllSectionVisibility } from "../../types";
import { AnimatedCard } from "./AnimatedCard";
import { useShowCards } from "./useShowCards";
import { useFadeIn } from "./useFadeIn";
import { useCardFocusManagement } from "./useCardFocusManagement";

interface CardCarouselProps {
	visibility: AllSectionVisibility;
	isReady: boolean;
	activeSection: number;
}

/**
 * Screen reader only styles for accessibility announcements
 */
const srOnlyStyle: React.CSSProperties = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	padding: '0',
	margin: '-1px',
	overflow: 'hidden',
	clip: 'rect(0, 0, 0, 0)',
	whiteSpace: 'nowrap',
	borderWidth: '0',
};

/**
 * Renders all cards with their visibility states
 * Cards are rendered dynamically from cardsConfig with scroll-based animations
 * 
 * Refactored to use specialized hooks for:
 * - Show/hide debug mode (useShowCards)
 * - Initial fade-in animation (useFadeIn)
 * - Focus management between cards (useCardFocusManagement)
 */
export function CardCarousel({ visibility, isReady, activeSection }: CardCarouselProps) {
	// Create refs for each card container
	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Use extracted hooks
	const { showCards } = useShowCards();
	const { wrapperStyle } = useFadeIn({ isReady });
	useCardFocusManagement({ activeSection });

	// Map card IDs to their visibility state
	const visibilityMap = useMemo(() => ({
		about: visibility.about,
		links: visibility.links,
		contact: visibility.contact,
	}), [visibility.about, visibility.links, visibility.contact]);

	// Don't render if not ready or showCards is disabled
	if (!isReady || !showCards) {
		return null;
	}

	return (
		<div
			style={wrapperStyle}
			role="region"
			aria-roledescription="carousel"
			aria-label="Leon's Profile"
		>
			{/* Screen reader announcement for section changes */}
			<div className="sr-only" aria-live="polite" aria-atomic="true" style={srOnlyStyle}>
				{`Now showing: ${cardsConfig[activeSection]?.label || 'Section'} section`}
			</div>

			{/* Render cards dynamically from config */}
			{cardsConfig.map((cardConfig, index) => {
				const CardComponent = cardConfig.component;
				const cardVisibility = visibilityMap[cardConfig.id as keyof typeof visibilityMap];

				return (
					<div
						key={cardConfig.id}
						ref={(el) => { cardRefs.current[index] = el; }}
						data-card-section={index}
					>
						<AnimatedCard
							visibility={cardVisibility}
							padding={cardConfig.style.padding}
							mobilePadding={cardConfig.style.mobilePadding}
							mobileBorderRadius={cardConfig.style.mobileBorderRadius}
							ariaLabel={`${cardConfig.label} section`}
						>
							<CardComponent />
						</AnimatedCard>
					</div>
				);
			})}
		</div>
	);
}
