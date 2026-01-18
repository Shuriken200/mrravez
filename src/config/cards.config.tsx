/**
 * Centralized card configuration
 * Add, remove, or reorder cards here - carousel and dots auto-adapt
 */

import { AboutCard, LinksCard, ContactCard } from "@/components/cards";

/**
 * Style configuration for card animation wrapper
 */
export interface CardStyleConfig {
	/** Padding for the card content */
	padding: string;
	/** Mobile-specific padding (applied at max-width: 480px) */
	mobilePadding: string;
	/** Mobile-specific border radius (applied at max-width: 480px) */
	mobileBorderRadius: number;
}

export interface CardConfig {
	/** Unique identifier */
	id: string;
	/** URL path (e.g., "/about") */
	path: string;
	/** Display label for accessibility and UI */
	label: string;
	/** Pure content component (no animation props) */
	component: React.ComponentType;
	/** Style configuration for the animated wrapper */
	style: CardStyleConfig;
}

/**
 * Default style configuration shared by all cards
 * Individual cards can override these values if needed
 */
const defaultCardStyle: CardStyleConfig = {
	padding: "clamp(16px, 4vw, 30px)",
	mobilePadding: "20px",
	mobileBorderRadius: 40,
};

export const cardsConfig: CardConfig[] = [
	{
		id: "about",
		path: "/about",
		label: "About",
		component: AboutCard,
		style: { ...defaultCardStyle },
	},
	{
		id: "links",
		path: "/links",
		label: "Links",
		component: LinksCard,
		style: { ...defaultCardStyle },
	},
	{
		id: "contact",
		path: "/contact",
		label: "Contact",
		component: ContactCard,
		style: { ...defaultCardStyle },
	},
];

// Derived constants
export const CARD_COUNT = cardsConfig.length;
export const CARD_PATHS = cardsConfig.map(c => c.path);

// Section paths for URL synchronization
// Used by navigation hooks to update URL as user navigates
export const SECTION_PATHS = cardsConfig.map(c => c.path) as readonly string[];

// Debug mode section paths (prefixed with /debug)
export const DEBUG_SECTION_PATHS = cardsConfig.map(c => `/debug${c.path}`) as readonly string[];

/**
 * Get card index by ID
 * @param id - The card ID to look up
 * @returns The index of the card, or -1 if not found
 */
export function getCardIndexById(id: string): number {
	return cardsConfig.findIndex(card => card.id === id);
}

/**
 * Map of card IDs to their indices for quick lookup
 */
export const cardIdToIndex: Record<string, number> = Object.fromEntries(
	cardsConfig.map((card, index) => [card.id, index])
);

/**
 * Set of valid card IDs for validation
 */
export const validCardIds = new Set(cardsConfig.map(card => card.id));
