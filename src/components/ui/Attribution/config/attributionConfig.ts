/**
 * Configuration for Attribution component
 * Follows Open/Closed Principle - extend by adding new config values
 */

export const attributionConfig = {
	/** Author information */
	author: {
		name: "Leon Joachim Buverud De Backer",
		displayPrefix: "@",
	},

	/** Link configuration */
	link: {
		href: "https://mrravez.no",
		target: "_blank",
		rel: "noopener noreferrer",
	},

	/** Hosts where attribution should be hidden (same-site) */
	hiddenHosts: ["de-backer.no", "www.de-backer.no"] as readonly string[],

	/** Styling configuration */
	styles: {
		spacing: {
			paddingVertical: 24,
			paddingHorizontal: 24,
		},
		pill: {
			paddingVertical: 6,
			paddingHorizontal: 14,
			borderRadius: 9999,
		},
		colors: {
			text: "rgba(255, 255, 255, 0.5)",
			textHover: "rgba(255, 255, 255, 0.8)",
		},
		typography: {
			fontSize: 12,
			letterSpacing: "0.02em",
		},
		transitions: {
			all: "color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
		},
		zIndex: 100,
	},
} as const;

/** Type for attribution config */
export type AttributionConfig = typeof attributionConfig;
