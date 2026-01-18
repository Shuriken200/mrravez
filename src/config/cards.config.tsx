/**
 * Centralized card configuration
 * Add, remove, or reorder cards here - carousel and dots auto-adapt
 */

import { AboutCard, LinksCard, ContactCard } from "@/components/cards";

export interface CardConfig {
	id: string;           // Unique identifier
	path: string;         // URL path (e.g., "/about")
	label: string;        // For accessibility
	component: React.ComponentType;  // Pure content component (no animation props)
}

export const cardsConfig: CardConfig[] = [
	{
		id: "about",
		path: "/about",
		label: "About",
		component: AboutCard,
	},
	{
		id: "links",
		path: "/links",
		label: "Links",
		component: LinksCard,
	},
	{
		id: "contact",
		path: "/contact",
		label: "Contact",
		component: ContactCard,
	},
];

// Derived constants
export const CARD_COUNT = cardsConfig.length;
export const CARD_PATHS = cardsConfig.map(c => c.path);
