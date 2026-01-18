"use client";

// =============================================================================
// useCanvasSync - Canvas dimension synchronization
// =============================================================================

import { useCallback } from 'react';
import { type WindowSize } from '../shared/types';

/**
 * Syncs canvas dimensions with window size.
 * 
 * Single Responsibility: Canvas size management only.
 */
export function useCanvasSync() {
	const syncCanvasDimensions = useCallback((
		canvas: HTMLCanvasElement | null,
		visualCanvas: HTMLCanvasElement | null,
		windowSize: WindowSize
	): void => {
		if (canvas && (canvas.width !== windowSize.width || canvas.height !== windowSize.height)) {
			canvas.width = windowSize.width;
			canvas.height = windowSize.height;
		}
		if (visualCanvas && (visualCanvas.width !== windowSize.width || visualCanvas.height !== windowSize.height)) {
			visualCanvas.width = windowSize.width;
			visualCanvas.height = windowSize.height;
		}
	}, []);

	return {
		syncCanvasDimensions,
	};
}
