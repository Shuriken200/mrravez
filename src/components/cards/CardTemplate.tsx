"use client";

import { ReactNode } from "react";
import styles from "./CardTemplate.module.css";

interface CardTemplateProps {
	title: string;
	children: ReactNode;
	/** Additional gap between title and content. Default: 20px */
	contentGap?: number;
}

/**
 * Shared card template for consistent styling across all cards.
 * Provides standardized title placement and content layout.
 */
export function CardTemplate({ title, children, contentGap = 20 }: CardTemplateProps) {
	return (
		<div className={styles.content} style={{ gap: `${contentGap}px` }}>
			<h1 className={styles.title}>
				{title}
			</h1>
			{children}
		</div>
	);
}
