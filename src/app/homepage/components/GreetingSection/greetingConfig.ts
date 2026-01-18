/**
 * Configuration for greeting section text and timing
 * Centralized text content and animation parameters
 */

export interface GreetingConfig {
	// Text content
	hiText: string;
	welcomeText: string;

	// Font sizes (CSS clamp strings)
	hiFontSize: string;
	welcomeFontSize: string;

	// Font weights
	hiFontWeight: number;
	welcomeFontWeight: number;

	// Colors
	hiColorEmerging: string;
	hiColorLightBurst: string;
	hiColorDarkBurst: string;

	// Text shadows
	hiTextShadowPopped: string;
	hiTextShadowEmerging: string;

	// Transition durations (for inline styles)
	hiFadeOutTransition: string;
	hiPoppedTransition: string;
	hiEmergingTransition: string;
	welcomeTransition: string;
}

/**
 * Default greeting configuration
 */
export const defaultGreetingConfig: GreetingConfig = {
	// Text content
	hiText: "Hi!",
	welcomeText: "Welcome to MrRavez, a hub for livestreams and videos",

	// Font sizes
	hiFontSize: "clamp(5rem, 20vw, 14rem)",
	welcomeFontSize: "clamp(1.8rem, 5vw, 2.5rem)",

	// Font weights
	hiFontWeight: 700,
	welcomeFontWeight: 500,

	// Colors
	hiColorEmerging: "#999999",
	hiColorLightBurst: "#1a1a1a",
	hiColorDarkBurst: "#ffffff",

	// Text shadows (red glow effect)
	hiTextShadowPopped:
		"0 0 100px rgba(78, 5, 6, 0.8), 0 0 200px rgba(78, 5, 6, 0.4), 0 0 300px rgba(78, 5, 6, 0.2)",
	hiTextShadowEmerging: "0 0 60px rgba(78, 5, 6, 0.4), 0 0 120px rgba(78, 5, 6, 0.2)",

	// Transitions
	hiFadeOutTransition: "opacity 0.8s ease-out, transform 0.8s ease-out",
	hiPoppedTransition:
		"color 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease, text-shadow 0.5s ease",
	hiEmergingTransition: "color 12s linear, transform 10s ease-out, opacity 2s ease-out, text-shadow 5s ease 3s",
	welcomeTransition: "opacity 1.5s ease-out",
};

/**
 * Singleton configuration instance
 */
export const greetingConfig: GreetingConfig = defaultGreetingConfig;
