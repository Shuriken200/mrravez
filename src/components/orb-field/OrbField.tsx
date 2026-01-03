"use client";

// =============================================================================
// OrbField - SOLID Controller for Grid System
// =============================================================================

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
	GridConfigFactory 
} from './grid/core/GridConfigFactory';
import { 
	SpatialGrid 
} from './grid/core/SpatialGrid';
import { 
	OrbPhysics 
} from './orb/core/OrbPhysics';
import { 
	type GridConfig,
	type ViewportCells
} from './grid/types';
import {
	type Orb
} from './orb/types';
import { 
	DEFAULT_REVEAL_CONFIG, 
	DEFAULT_STYLE_CONFIG, 
	type GridRevealConfig, 
	type GridStyleConfig 
} from './shared/config';
import { GridRenderer } from './grid/visuals/GridRenderer';
import { GridAnimator } from './grid/visuals/GridAnimator';
import { OrbDebugPanel } from './debug-info/components/OrbDebugPanel';
import { GridDebugPanel } from './debug-info/components/GridDebugPanel';

/** Global debug flag based on environment variable. */
const IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

interface OrbFieldProps {
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

// Interface ViewportCells removed as it is imported from grid/types

/**
 * Main React Component for the Grid System.
 * Acts as a Controller: orchestrates state, initialization, animation, and user interaction.
 */
export function OrbField({
	visible = true,
	layer: initialLayer = 0,
	opacity = 0.6,
	revealConfig: revealOverrides,
	styleConfig: styleOverrides,
}: OrbFieldProps) {
	// --- Refs for High-Performance Loop (No Re-renders) ---
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const gridRef = useRef<SpatialGrid | null>(null);
	const orbsRef = useRef<Orb[]>([]);
	const animatorRef = useRef<GridAnimator | null>(null);
	const loopIdRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const rollProgressRef = useRef(0);
	const hasAnimatedRef = useRef(false);
	
	// Refs for stable access inside the loop without re-triggering effects
	const viewportCellsRef = useRef<ViewportCells | null>(null);
	const windowSizeRef = useRef({ width: 0, height: 0 });
	const currentLayerRef = useRef(initialLayer);
	const hoveredCellRef = useRef<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
	const selectedOrbIdRef = useRef<string | null>(null);
	
	// --- React State for UI / Debug Panel ---
	const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
	const [viewportCells, setViewportCells] = useState<ViewportCells | null>(null);
	const [orbs, setOrbs] = useState<Orb[]>([]);
	const [selectedOrbId, setSelectedOrbId] = useState<string | null>(null);
	const [selectedOrbData, setSelectedOrbData] = useState<Orb | null>(null);
	const [currentLayer, setCurrentLayer] = useState(initialLayer);
	const [orbSize, setOrbSize] = useState(1);
	const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	const [isMounted, setIsMounted] = useState(false);
	
	// --- Configs (Memoized) ---
	const revealConfig = useMemo(() => ({ ...DEFAULT_REVEAL_CONFIG, ...revealOverrides }), [revealOverrides]);
	const styleConfig = useMemo(() => ({ ...DEFAULT_STYLE_CONFIG, ...styleOverrides }), [styleOverrides]);
	
	const revealConfigRef = useRef(revealConfig);
	const styleConfigRef = useRef(styleConfig);
	const opacityRef = useRef(opacity);
	
	useEffect(() => { revealConfigRef.current = revealConfig; }, [revealConfig]);
	useEffect(() => { styleConfigRef.current = styleConfig; }, [styleConfig]);
	useEffect(() => { opacityRef.current = opacity; }, [opacity]);
	useEffect(() => { currentLayerRef.current = currentLayer; }, [currentLayer]);
	useEffect(() => { selectedOrbIdRef.current = selectedOrbId; }, [selectedOrbId]);

	// --- 1. Mount & Resize Logic ---
	useEffect(() => {
		const frameId = requestAnimationFrame(() => setIsMounted(true));
		
		if (typeof window === 'undefined') return () => cancelAnimationFrame(frameId);
		
		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			setWindowSize({ width, height });
			windowSizeRef.current = { width, height };
		};
		
		handleResize();
		window.addEventListener('resize', handleResize);
		
		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(frameId);
		};
	}, []);
	
	// --- 2. Grid Initialization (Only on Resize) ---
	useEffect(() => {
		if (windowSize.width === 0) return;
		
		const config = GridConfigFactory.create(window);
		const newGrid = new SpatialGrid(config);
		
		// Setup viewport metrics
		const { cellSizeXCm, cellSizeYCm, viewportMinXCm, viewportMaxXCm, viewportMinYCm, viewportMaxYCm, minXCm, minYCm, pixelsPerCm } = config;
		const cellSizeXPx = cellSizeXCm * pixelsPerCm;
		const cellSizeYPx = cellSizeYCm * pixelsPerCm;
		
		const vpc: ViewportCells = {
			startCellX: Math.round((viewportMinXCm - minXCm) / cellSizeXCm),
			endCellX: Math.round((viewportMaxXCm - minXCm) / cellSizeXCm),
			startCellY: Math.round((viewportMinYCm - minYCm) / cellSizeYCm),
			endCellY: Math.round((viewportMaxYCm - minYCm) / cellSizeYCm),
			cellSizeXPx,
			cellSizeYPx,
			invCellSizeXPx: 1 / cellSizeXPx,
			invCellSizeYPx: 1 / cellSizeYPx,
			cellSizeXCm,
			cellSizeYCm,
		};

		// Critical: Update Refs for loop immediate access
		gridRef.current = newGrid;
		viewportCellsRef.current = vpc;
		
		// Update State for React UI
		queueMicrotask(() => {
			setGridConfig(config);
			setViewportCells(vpc);
		});
		
		// Reset animation state on resize
		hasAnimatedRef.current = false;
		rollProgressRef.current = 0;
		
	}, [windowSize]);
	
	// --- 3. Unified Update Loop (Stable) ---
	const runLoop = useCallback((easedProgress: number, deltaTime: number) => {
		const canvas = canvasRef.current;
		const grid = gridRef.current;
		const vpc = viewportCellsRef.current;
		const ws = windowSizeRef.current;
		
		if (!canvas || !grid || !vpc || ws.width === 0) return;
		
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		// A. Physics Logic
		if (easedProgress >= 1) {
			grid.clear();
			const currentOrbs = orbsRef.current;
			for (const orb of currentOrbs) {
				OrbPhysics.updatePosition(orb, deltaTime);
				OrbPhysics.markOrb(grid, orb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			}
		}
		
		// B. Rendering Sync
		if (canvas.width !== ws.width || canvas.height !== ws.height) {
			canvas.width = ws.width;
			canvas.height = ws.height;
		}
		
		// C. Reveal Fading Logic
		let finalOpacity = opacityRef.current;
		if (!IS_DEBUG_MODE) {
			const FADE_START = 0.8;
			if (easedProgress > FADE_START) {
				const fadeFactor = (easedProgress - FADE_START) / (1 - FADE_START);
				finalOpacity *= (1 - fadeFactor);
			}
		}
		canvas.style.opacity = finalOpacity.toString();
		
		// D. Render Call
		GridRenderer.draw(
			ctx,
			ws,
			vpc,
			easedProgress,
			revealConfigRef.current,
			styleConfigRef.current,
			IS_DEBUG_MODE ? hoveredCellRef.current : null,
			grid,
			currentLayerRef.current,
			IS_DEBUG_MODE ? orbsRef.current : []
		);

		// E. Debug State Sync (Real-time Position)
		if (IS_DEBUG_MODE && selectedOrbIdRef.current) {
			const found = orbsRef.current.find(o => o.id === selectedOrbIdRef.current);
			if (found) {
				// We update a specialized state for the selected orb
				setSelectedOrbData({ ...found });
			}
		}
	}, []);

	// --- 4. Loop Controller ---
	useEffect(() => {
		if (!visible || !gridConfig) return;
		
		animatorRef.current = new GridAnimator(
			revealConfig.duration,
			(progress, eased) => {
				const now = performance.now();
				const dt = lastFrameTimeRef.current ? (now - lastFrameTimeRef.current) / 1000 : 0;
				lastFrameTimeRef.current = now;
				
				rollProgressRef.current = eased;
				runLoop(eased, dt);
			},
			() => {
				hasAnimatedRef.current = true;
				const physicsLoop = () => {
					if (!hasAnimatedRef.current) return;
					const now = performance.now();
					const dt = (now - lastFrameTimeRef.current) / 1000;
					lastFrameTimeRef.current = now;
					
					runLoop(1, dt);
					loopIdRef.current = requestAnimationFrame(physicsLoop);
				};
				loopIdRef.current = requestAnimationFrame(physicsLoop);
			}
		);
		
		animatorRef.current.start();
		
		return () => {
			animatorRef.current?.stop();
			if (loopIdRef.current) cancelAnimationFrame(loopIdRef.current);
			hasAnimatedRef.current = false;
		};
	}, [visible, gridConfig, runLoop, revealConfig.duration]);

	// --- 5. Interaction Handlers ---
	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		const vpc = viewportCellsRef.current;
		const gc = gridConfig;
		if (!vpc || !gc || rollProgressRef.current < 1 || !IS_DEBUG_MODE) return;
		
		const cellX = vpc.startCellX + Math.floor(e.clientX / vpc.cellSizeXPx);
		const cellY = vpc.startCellY + Math.floor(e.clientY / vpc.cellSizeYPx);
		
		const cellInfo = { 
			x: cellX, 
			y: cellY, 
			worldX: gc.minXCm + cellX * vpc.cellSizeXCm, 
			worldY: gc.minYCm + cellY * vpc.cellSizeYCm 
		};
		
		hoveredCellRef.current = cellInfo;
		setHoveredCell(cellInfo);
	}, [gridConfig]);

	const handleClick = useCallback((e: React.MouseEvent) => {
		const vpc = viewportCellsRef.current;
		if (!gridRef.current || !vpc || !IS_DEBUG_MODE) return;

		const angle = Math.random() * Math.PI * 2;
		const speed = 50 + Math.random() * 100;

		const newOrb: Orb = {
			id: crypto.randomUUID(),
			pxX: e.clientX,
			pxY: e.clientY,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			speed,
			angle,
			layer: currentLayerRef.current,
			size: orbSize
		};

		orbsRef.current.push(newOrb);
		setOrbs([...orbsRef.current]);
		setSelectedOrbId(newOrb.id);
		
		OrbPhysics.markOrb(gridRef.current, newOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
	}, [orbSize]);

	const handleDeleteOrb = useCallback((id: string) => {
		const grid = gridRef.current;
		const vpc = viewportCellsRef.current;
		if (!grid || !vpc) return;
		
		const orbToDelete = orbsRef.current.find(o => o.id === id);
		if (orbToDelete) {
			OrbPhysics.clearOrb(grid, orbToDelete, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			orbsRef.current = orbsRef.current.filter(o => o.id !== id);
			setOrbs([...orbsRef.current]);
			if (selectedOrbId === id) {
				setSelectedOrbId(null);
				setSelectedOrbData(null);
			}
		}
	}, [selectedOrbId]);

	if (!visible || !isMounted) return null;
	
	return (
		<>
			<canvas
				ref={canvasRef}
				onMouseMove={handleMouseMove}
				onMouseLeave={() => {
					hoveredCellRef.current = null;
					setHoveredCell(null);
				}}
				onClick={handleClick}
				style={{ 
					position: 'fixed', 
					inset: 0, 
					pointerEvents: IS_DEBUG_MODE ? 'auto' : 'none', 
					opacity, 
					zIndex: 1 
				}}
			/>
			
			{IS_DEBUG_MODE && gridConfig && viewportCells && (
				<div style={{
					position: 'fixed', top: 16, right: 16, display: 'flex', flexDirection: 'row-reverse', 
					alignItems: 'flex-start', gap: 12, zIndex: 2 
				}}>
					<OrbDebugPanel 
						orbs={orbs} 
						selectedOrbId={selectedOrbId} 
						selectedOrb={selectedOrbData}
						orbSize={orbSize}
						onSelectOrb={setSelectedOrbId} 
						onDeleteOrb={handleDeleteOrb} 
						onSizeChange={setOrbSize} 
					/>

					<GridDebugPanel 
						gridConfig={gridConfig} 
						viewportCells={viewportCells} 
						currentLayer={currentLayer} 
						onLayerChange={setCurrentLayer} 
						hoveredCell={hoveredCell} 
					/>
				</div>
			)}
		</>
	);
}

export default OrbField;
