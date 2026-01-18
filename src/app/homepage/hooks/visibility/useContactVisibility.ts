/**
 * Selector hooks for visibility state
 * Following Interface Segregation Principle - components only depend on what they need
 */

import { useMemo } from "react";
import type { AllSectionVisibility, SectionVisibility } from "../../types";

/**
 * Contact-only visibility selector
 * Used by GlassSlider which only needs contact section visibility
 */
export interface ContactVisibility {
	entryProgress: number;
}

/**
 * Extract only contact visibility for components that don't need full state
 */
export function useContactVisibility(visibility: AllSectionVisibility): ContactVisibility {
	return useMemo(
		() => ({
			entryProgress: visibility.contact.entryProgress,
		}),
		[visibility.contact.entryProgress]
	);
}

/**
 * Get full section visibility for a specific card
 */
export function useCardVisibility(
	visibility: AllSectionVisibility,
	cardId: "about" | "links" | "contact"
): SectionVisibility {
	return useMemo(() => visibility[cardId], [visibility, cardId]);
}
