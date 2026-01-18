/**
 * Hook for managing card focus when navigating between sections
 * Automatically focuses first focusable element when switching cards
 */

import { useEffect, useRef } from "react";
import { transitionConfig } from "../../config";

export interface UseCardFocusManagementOptions {
	activeSection: number;
}

/**
 * Manages focus transition between cards
 * Only auto-focuses if a button in the previous card was focused
 */
export function useCardFocusManagement({ activeSection }: UseCardFocusManagementOptions): void {
	const previousActiveSectionRef = useRef<number>(activeSection);

	useEffect(() => {
		// Only handle focus if the active section has changed
		if (previousActiveSectionRef.current === activeSection) {
			return;
		}

		const previousSection = previousActiveSectionRef.current;
		previousActiveSectionRef.current = activeSection;

		// Check if focus is currently on a button within a card
		const activeElement = document.activeElement as HTMLElement;
		const isButtonFocused = activeElement?.classList.contains('glass-button-link');
		const previousCard = document.querySelector(`[data-card-section="${previousSection}"]`);
		const wasFocusedInPreviousCard = previousCard?.contains(activeElement);

		// Only auto-focus if a button in the previous card was focused
		if (!isButtonFocused || !wasFocusedInPreviousCard) {
			return;
		}

		// Focus the first focusable element on the new card after a delay
		setTimeout(() => {
			const newCard = document.querySelector(`[data-card-section="${activeSection}"]`);
			if (!newCard) {
				return;
			}

			// Find all glass-button-link elements in the new card
			const focusableElements = newCard.querySelectorAll<HTMLElement>('.glass-button-link');

			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			}
		}, transitionConfig.cardFocusDelay);
	}, [activeSection]);
}
