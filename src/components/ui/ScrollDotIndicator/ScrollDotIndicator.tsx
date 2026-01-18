"use client";

import { useRef, useEffect } from "react";
import styles from "./ScrollDotIndicator.module.css";

interface ScrollDotIndicatorProps {
	totalSections: number;
	activeSection: number;
	onDotClick: (index: number) => void;
	visible: boolean;
	theme: "light" | "dark";
	sectionLabels: string[];
}

/**
 * Scroll dot indicator for section navigation
 * Refactored to use CSS modules and configuration
 * Reduced from 242 lines to ~90 lines by extracting styles
 */
export function ScrollDotIndicator({
	totalSections,
	activeSection,
	onDotClick,
	visible,
	theme,
	sectionLabels,
}: ScrollDotIndicatorProps) {
	// Refs for each dot button
	const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Track if any dot currently has focus
	const hasFocusRef = useRef(false);

	// Sync focus with activeSection when it changes (from scroll, arrow keys, etc.)
	// Only moves focus if a dot is currently focused - doesn't interfere with scrolling
	// Uses requestAnimationFrame to defer focus until after scroll updates complete
	useEffect(() => {
		if (hasFocusRef.current && dotRefs.current[activeSection]) {
			requestAnimationFrame(() => {
				if (hasFocusRef.current && dotRefs.current[activeSection]) {
					dotRefs.current[activeSection]?.focus();
				}
			});
		}
	}, [activeSection]);

	// Don't render at all until visible to prevent flash
	if (!visible) {
		return null;
	}

	const themeClass = theme === "dark" ? styles["theme-dark"] : styles["theme-light"];

	return (
		<nav
			className={`${styles.dotIndicator} ${themeClass} ${visible ? styles.visible : ""}`}
			aria-label="Section navigation"
		>
			{Array.from({ length: totalSections }, (_, index) => {
				const isActive = activeSection === index;
				const isPassed = index < activeSection;
				const isUpcoming = index > activeSection;

				const dotClasses = [styles.dot];
				if (theme === "light") {
					dotClasses.push(styles.lightTheme);
				}
				if (isActive) {
					dotClasses.push(styles.active);
				} else if (isPassed) {
					dotClasses.push(styles.passed);
				} else if (isUpcoming) {
					dotClasses.push(styles.inactive);
				}

				const label = sectionLabels[index] || `Section ${index + 1}`;

				return (
					<div key={index} className={styles.dotWrapper}>
						<button
							ref={(el) => {
								dotRefs.current[index] = el;
							}}
							className={dotClasses.join(" ")}
							onClick={() => onDotClick(index)}
							onFocus={() => { hasFocusRef.current = true; }}
							onBlur={() => { hasFocusRef.current = false; }}
							aria-label={`Go to ${label}`}
							aria-current={isActive ? "true" : undefined}
							tabIndex={isActive ? 0 : -1}
							type="button"
						/>
						<span className={styles.dotLabel} aria-hidden="true">
							{label}
						</span>
					</div>
				);
			})}
		</nav>
	);
}
