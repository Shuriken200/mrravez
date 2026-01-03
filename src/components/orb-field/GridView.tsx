"use client";

// =============================================================================
// GridView - 3D Spatial Grid Visualization
// =============================================================================

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
    SpatialGrid, 
    createGridConfig, 
    type GridConfig,
} from './SpatialGrid';

interface GridViewProps {
    /** Whether the grid view is visible */
    visible?: boolean;
    /** Which depth layer to display (0 = front, layers-1 = back) */
    layer?: number;
    /** Opacity of the grid overlay */
    opacity?: number;
}

/**
 * Grid visualization component
 * Shows grid cells with a roll-down reveal animation
 */
export function GridView({
    visible = true,
    layer: initialLayer = 0,
    opacity = 0.6,
}: GridViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gridConfig, setGridConfig] = useState<GridConfig | null>(null);
    const [grid, setGrid] = useState<SpatialGrid | null>(null);
    const [currentLayer, setCurrentLayer] = useState(initialLayer);
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
    
    // Store window dimensions to detect changes
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    
    // Animation state for roll-down effect
    const rollProgressRef = useRef(0);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const isAnimatingRef = useRef(false);
    const hasAnimatedRef = useRef(false);
    
    // Listen for resize to update windowSize
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        
        // Initial size
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Initialize grid ONLY when window size changes
    useEffect(() => {
        if (windowSize.width === 0 || windowSize.height === 0) return;
        
        const config = createGridConfig();
        if (!config) return;
        
        const newGrid = new SpatialGrid(config);
        
        // Defer state updates to avoid cascading renders
        queueMicrotask(() => {
            setGridConfig(config);
            setGrid(newGrid);
            
            // If we already animated, skip reveal on resize
            if (hasAnimatedRef.current) {
                rollProgressRef.current = 1;
            }
        });
    }, [windowSize]);
    
    // Reset animation ONLY when visibility toggles from off to on
    useEffect(() => {
        if (visible && !hasAnimatedRef.current && !isAnimatingRef.current) {
            rollProgressRef.current = 0;
            startTimeRef.current = null;
        } else if (!visible) {
            hasAnimatedRef.current = false;
            isAnimatingRef.current = false;
            rollProgressRef.current = 0;
            startTimeRef.current = null;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
    }, [visible]);
    
    // Calculate viewport cell range
    const viewportCells = useMemo(() => {
        if (!gridConfig) return null;
        
        const { cellSizeXCm, cellSizeYCm, viewportMinXCm, viewportMaxXCm, viewportMinYCm, viewportMaxYCm, minXCm, minYCm, pixelsPerCm } = gridConfig;
        
        const startCellX = Math.round((viewportMinXCm - minXCm) / cellSizeXCm);
        const endCellX = Math.round((viewportMaxXCm - minXCm) / cellSizeXCm);
        const startCellY = Math.round((viewportMinYCm - minYCm) / cellSizeYCm);
        const endCellY = Math.round((viewportMaxYCm - minYCm) / cellSizeYCm);
        
        const cellSizeXPx = cellSizeXCm * pixelsPerCm;
        const cellSizeYPx = cellSizeYCm * pixelsPerCm;
        
        return {
            startCellX,
            endCellX,
            startCellY,
            endCellY,
            cellSizeXPx,
            cellSizeYPx,
            cellSizeXCm,
            cellSizeYCm,
            pixelsPerCm,
        };
    }, [gridConfig]);
    
    // Main draw function
    const draw = useCallback((ctx: CanvasRenderingContext2D, revealProgress: number) => {
        if (!grid || !gridConfig || !viewportCells || !windowSize.width) return;
        
        const { width, height } = windowSize;
        const { startCellX, endCellX, startCellY, endCellY, cellSizeXPx, cellSizeYPx } = viewportCells;
        
        const cellsInViewX = endCellX - startCellX;
        const cellsInViewY = endCellY - startCellY;
        
        // Colors
        const baseGreyR = 100;
        const baseGreyG = 100;
        const baseGreyB = 130;
        
        const whiteToGreyDistance = 200;
        const fadeInDistance = 150;
        
        // Animation positions
        const startY = -200;
        const endY = height + 500;
        const fadeEndY = startY + revealProgress * (endY - startY);
        const whiteStartY = fadeEndY - fadeInDistance;
        
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 0.5;
        
        for (let cy = 0; cy <= cellsInViewY; cy++) {
            const y = cy * cellSizeYPx;
            if (y > fadeEndY) continue;
            
            let revealOpacity = 1;
            if (y > whiteStartY) {
                revealOpacity = (fadeEndY - y) / fadeInDistance;
                revealOpacity = Math.max(0, Math.min(1, revealOpacity));
                revealOpacity = revealOpacity * revealOpacity * (3 - 2 * revealOpacity);
            }
            
            if (revealOpacity < 0.01) continue;
            
            const distanceAboveWhite = whiteStartY - y;
            let greyMix = 0;
            if (distanceAboveWhite > 0) {
                greyMix = Math.min(1, distanceAboveWhite / whiteToGreyDistance);
                greyMix = greyMix * greyMix * (3 - 2 * greyMix);
            }
            
            const r = Math.round(255 - (255 - baseGreyR) * greyMix);
            const g = Math.round(255 - (255 - baseGreyG) * greyMix);
            const b = Math.round(255 - (255 - baseGreyB) * greyMix);
            
            const baseAlphaVal = 0.7 - 0.35 * greyMix;
            const alpha = baseAlphaVal * revealOpacity;
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            
            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            
            // Vertical lines for this row
            for (let cx = 0; cx <= cellsInViewX; cx++) {
                const x = cx * cellSizeXPx;
                const nextY = (cy + 1) * cellSizeYPx;
                const lineEndY = Math.min(nextY, fadeEndY);
                
                if (lineEndY > y) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, lineEndY);
                    ctx.stroke();
                }
            }
        }
        
        // Highlight hovered cell
        if (revealProgress >= 1 && hoveredCell) {
            const hx = (hoveredCell.x - startCellX) * cellSizeXPx;
            const hy = (hoveredCell.y - startCellY) * cellSizeYPx;
            ctx.fillStyle = 'rgba(80, 200, 150, 0.2)';
            ctx.fillRect(hx, hy, cellSizeXPx, cellSizeYPx);
            ctx.strokeStyle = 'rgba(80, 200, 150, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(hx, hy, cellSizeXPx, cellSizeYPx);
        }
    }, [grid, gridConfig, viewportCells, windowSize, hoveredCell]);
    
    // Animation/Update Loop
    useEffect(() => {
        if (!visible || !grid || !gridConfig || !viewportCells || !canvasRef.current || windowSize.width === 0) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Sync canvas size
        canvas.width = windowSize.width;
        canvas.height = windowSize.height;
        
        if (hasAnimatedRef.current) {
            draw(ctx, 1);
            return;
        }
        
        isAnimatingRef.current = true;
        
        const animate = (timestamp: number) => {
            if (!isAnimatingRef.current) return;
            
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp;
            }
            
            const elapsed = timestamp - startTimeRef.current;
            const duration = 1500;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            rollProgressRef.current = eased;
            draw(ctx, eased);
            
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                isAnimatingRef.current = false;
                hasAnimatedRef.current = true;
            }
        };
        
        animationRef.current = requestAnimationFrame(animate);
        
        return () => {
            isAnimatingRef.current = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [visible, grid, gridConfig, viewportCells, windowSize, draw]);
    
    // Handle mouse move for cell hover
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!viewportCells || !grid || !gridConfig || rollProgressRef.current < 1) return;
        
        const { startCellX, startCellY, cellSizeXPx, cellSizeYPx, cellSizeXCm, cellSizeYCm } = viewportCells;
        
        const cellX = startCellX + Math.floor(e.clientX / cellSizeXPx);
        const cellY = startCellY + Math.floor(e.clientY / cellSizeYPx);
        
        const worldX = gridConfig.minXCm + cellX * cellSizeXCm;
        const worldY = gridConfig.minYCm + cellY * cellSizeYCm;
        
        setHoveredCell({ x: cellX, y: cellY, worldX, worldY });
    }, [viewportCells, grid, gridConfig]);
    
    if (!visible) return null;
    
    return (
        <>
            {/* Canvas overlay */}
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredCell(null)}
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'auto',
                    opacity,
                    zIndex: 1,
                }}
            />
            
            {/* Info panel */}
            {gridConfig && viewportCells && (
                <div style={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    padding: 12,
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid #333',
                    borderRadius: 6,
                    color: 'white',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    zIndex: 2,
                    backdropFilter: 'blur(4px)',
                }}>
                    <div style={{ marginBottom: 4 }}>
                        <strong>Grid:</strong> {gridConfig.cellsX}×{gridConfig.cellsY}×{gridConfig.layers}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                        <strong>Cell:</strong> {gridConfig.cellSizeXCm.toFixed(2)}×{gridConfig.cellSizeYCm.toFixed(2)}cm
                    </div>
                    <div style={{ marginBottom: 6 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <strong>Z:</strong>
                            <input
                                type="range"
                                min={0}
                                max={gridConfig.layers - 1}
                                value={currentLayer}
                                onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
                                style={{ width: 60 }}
                            />
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
