"use client";

// =============================================================================
// GridView - SOLID Controller for Grid System
// =============================================================================

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
	GridConfigFactory 
} from '../core/GridConfigFactory';
import { 
	type GridConfig 
} from '../core/types';
import { 
	DEFAULT_REVEAL_CONFIG, 
	DEFAULT_STYLE_CONFIG, 
	type GridRevealConfig, 
	type GridStyleConfig 
} from '../config';
import { GridRenderer } from './GridRenderer';
import { GridAnimator } from './GridAnimator';

interface GridViewProps {
	/** Visibility toggle for the entire grid system. */
	visible?: boolean;
	/** Currently active depth layer (visualization only). */
	layer?: number;
	/** Base opacity of the canvas element. */
	opacity?: number;
	/** Overrides for the reveal animation configuration. */
	revealConfig?: Partial<GridRevealConfig>;
	/** Overrides for the visual style configuration. */
	styleConfig?: Partial<GridStyleConfig>;
}

/**
 * Main React Component for the Grid System.
 * Acts as a Controller: orchestrates state, initialization, animation, and user interaction.
 * Delegates rendering to GridRenderer and animation logic to GridAnimator.
 */
export function GridView({
	visible = true,
	layer: initialLayer = 0,
	opacity = 0.6,
	revealConfig: revealOverrides,
	styleConfig: styleOverrides,
}: GridViewProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
	const [currentLayer, setCurrentLayer] = useState(initialLayer);
	const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	
	// Merge default configs with overrides
	const revealConfig = useMemo(() => ({ ...DEFAULT_REVEAL_CONFIG, ...revealOverrides }), [revealOverrides]);
	const styleConfig = useMemo(() => ({ ...DEFAULT_STYLE_CONFIG, ...styleOverrides }), [styleOverrides]);
	
	// Animation State References
	const rollProgressRef = useRef(0);
	const hasAnimatedRef = useRef(false);
	const animatorRef = useRef<GridAnimator | null>(null);
	
	// 1. Sync window size
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
		
		// Initial size check
		handleResize();
		
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);
	
	// 2. Initialize Grid Data (Model)
	useEffect(() => {
		if (windowSize.width === 0) return;
		
		// Create fresh grid configuration on resize
		const config = GridConfigFactory.create(window);
		
		// Update state asynchronously to avoid render loops
		queueMicrotask(() => {
			setGridConfig(config);
			// If we've already animated, keep the grid fully revealed on resize
			if (hasAnimatedRef.current) rollProgressRef.current = 1;
		});
	}, [windowSize]);
	
	// 3. Viewport Calculation (Memoized for performance)
	const viewportCells = useMemo(() => {
		if (!gridConfig) return null;
		const { cellSizeXCm, cellSizeYCm, viewportMinXCm, viewportMaxXCm, viewportMinYCm, viewportMaxYCm, minXCm, minYCm, pixelsPerCm } = gridConfig;
		
		return {
			startCellX: Math.round((viewportMinXCm - minXCm) / cellSizeXCm),
			endCellX: Math.round((viewportMaxXCm - minXCm) / cellSizeXCm),
			startCellY: Math.round((viewportMinYCm - minYCm) / cellSizeYCm),
			endCellY: Math.round((viewportMaxYCm - minYCm) / cellSizeYCm),
			cellSizeXPx: cellSizeXCm * pixelsPerCm,
			cellSizeYPx: cellSizeYCm * pixelsPerCm,
			cellSizeXCm,
			cellSizeYCm,
		};
	}, [gridConfig]);
	
	// 4. Drawing Callback
	const draw = useCallback((easedProgress: number) => {
		if (!canvasRef.current || !viewportCells || windowSize.width === 0) return;
		
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;
		
		// Sync canvas size to internal resolution
		if (canvasRef.current.width !== windowSize.width || canvasRef.current.height !== windowSize.height) {
			canvasRef.current.width = windowSize.width;
			canvasRef.current.height = windowSize.height;
		}
		
		GridRenderer.draw(
			ctx,
			windowSize,
			viewportCells,
			easedProgress,
			revealConfig,
			styleConfig,
			hoveredCell
		);
	}, [viewportCells, windowSize, revealConfig, styleConfig, hoveredCell]);
	
	// 5. Animation Controller
	useEffect(() => {
		if (!visible) {
			animatorRef.current?.stop();
			hasAnimatedRef.current = false;
			rollProgressRef.current = 0;
			return;
		}
		
		if (!gridConfig || !viewportCells) return;
		
		// If already animated (e.g., just a prop update), just redraw the static frame
		if (hasAnimatedRef.current) {
			draw(1);
			return;
		}
		
		// Start new reveal animation
		animatorRef.current = new GridAnimator(
			revealConfig.duration,
			(progress, eased) => {
				rollProgressRef.current = eased;
				draw(eased);
			},
			() => {
				hasAnimatedRef.current = true;
			}
		);
		animatorRef.current.start();
		
		return () => animatorRef.current?.stop();
	}, [visible, gridConfig, viewportCells, draw, revealConfig.duration]);
	
	// 6. Interaction Controller
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!viewportCells || !gridConfig || rollProgressRef.current < 1) return;
		
		const { startCellX, startCellY, cellSizeXPx, cellSizeYPx, cellSizeXCm, cellSizeYCm } = viewportCells;
		const cellX = startCellX + Math.floor(e.clientX / cellSizeXPx);
		const cellY = startCellY + Math.floor(e.clientY / cellSizeYPx);
		
		setHoveredCell({ 
			x: cellX, 
			y: cellY, 
			worldX: gridConfig.minXCm + cellX * cellSizeXCm, 
			worldY: gridConfig.minYCm + cellY * cellSizeYCm 
		});
	}, [viewportCells, gridConfig]);
	
	if (!visible) return null;
	
	return (
		<>
			<canvas
				ref={canvasRef}
				onMouseMove={handleMouseMove}
				onMouseLeave={() => setHoveredCell(null)}
				style={{ position: 'fixed', inset: 0, pointerEvents: 'auto', opacity, zIndex: 1 }}
			/>
			
			{/* Debug Info Panel */}
			{gridConfig && viewportCells && (
				<div style={{
					position: 'fixed', top: 16, right: 16, padding: 12,
					background: 'rgba(0,0,0,0.7)', border: '1px solid #333', borderRadius: 6,
					color: 'white', fontFamily: 'monospace', fontSize: 11, zIndex: 2,
					backdropFilter: 'blur(4px)',
				}}>
					<div style={{ marginBottom: 4 }}><strong>Grid:</strong> {gridConfig.cellsX}×{gridConfig.cellsY}×{gridConfig.layers}</div>
					<div style={{ marginBottom: 4 }}><strong>Cell:</strong> {viewportCells.cellSizeXCm.toFixed(2)}×{viewportCells.cellSizeYCm.toFixed(2)}cm</div>
					<div style={{ marginBottom: 6 }}>
						<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<strong>Z:</strong>
							<input type="range" min={0} max={gridConfig.layers - 1} value={currentLayer}
								onChange={(e) => setCurrentLayer(parseInt(e.target.value))} style={{ width: 60 }} />
							<span>{currentLayer}</span>
						</label>
					</div>
					{hoveredCell && (
						<div style={{ color: '#8f8', fontSize: 10 }}>
							Cell ({hoveredCell.x}, {hoveredCell.y}) • {hoveredCell.worldX.toFixed(1)}cm, {hoveredCell.worldY.toFixed(1)}cm
						</div>
					)}
				</div>
			)}
		</>
	);
}

export default GridView;
