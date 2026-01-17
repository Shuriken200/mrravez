"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, X, ChevronRight } from "lucide-react";
import { useDebugSafe, type DebugState } from "./DebugContext";
import { type Orb } from "../orb-field/orb/types";
import { type GridConfig, type ViewportCells } from "../orb-field/grid/types";
import { DEFAULT_ORB_SPAWN_CONFIG } from "../orb-field/orb/config";

interface ToggleItem {
	key: keyof Omit<DebugState, "enabled">;
	label: string;
	description?: string;
}

const toggleItems: ToggleItem[] = [
	{ key: "showGrid", label: "Grid Lines", description: "Spatial grid visualization" },
	{ key: "showCollisionArea", label: "Collision Area", description: "Red cells showing orb bodies" },
	{ key: "showAvoidanceArea", label: "Avoidance Area", description: "Yellow cells showing proximity zones" },
	{ key: "showGraphics", label: "Orb Graphics", description: "Visual orb rendering" },
	{ key: "showArrowVector", label: "Arrow Vectors", description: "Show velocity arrows on orbs" },
	{ key: "showTruePosition", label: "True Position", description: "Show position indicator dot" },
	{ key: "pausePhysics", label: "Pause Physics", description: "Freeze orb movement" },
	{ key: "enableOrbSpawning", label: "Orb Spawning", description: "Continuous orb spawning" },
	{ key: "enableOrbDespawning", label: "Orb Despawning", description: "Lifetime expiration" },
	{ key: "enableSpawnOnClick", label: "Click to Create", description: "Click to spawn orbs" },
	{ key: "showCards", label: "Show Cards", description: "Card carousel visibility" },
];

const defaultState: Omit<DebugState, "enabled"> = {
	showCollisionArea: true,
	showAvoidanceArea: true,
	enableSpawnOnClick: true,
	showGraphics: true,
	showCards: true,
	showArrowVector: true,
	showTruePosition: true,
	showGrid: true,
	enableOrbSpawning: true,
	enableOrbDespawning: true,
	pausePhysics: false,
};

/**
 * Props for GlassDebugMenu - optional data for unified mobile view
 */
interface GlassDebugMenuProps {
	// Orb debug data
	orbs?: Orb[];
	targetOrbCount?: number;
	selectedOrbId?: string | null;
	selectedOrb?: Orb | null;
	orbSize?: number;
	onSelectOrb?: (id: string | null) => void;
	onDeleteOrb?: (id: string) => void;
	onSizeChange?: (size: number) => void;
	// Grid debug data
	gridConfig?: GridConfig | null;
	viewportCells?: ViewportCells | null;
	currentLayer?: number;
	onLayerChange?: (layer: number) => void;
	hoveredCell?: { x: number; y: number; worldX: number; worldY: number } | null;
}

/**
 * Toggle slider component - similar to GlassSlider but smaller
 */
function ToggleSlider({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState(checked ? 1 : 0);
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef<{ x: number; startPosition: number } | null>(null);

	// Sync position with checked state
	useEffect(() => {
		setPosition(checked ? 1 : 0);
	}, [checked]);

	const calculatePosition = useCallback((clientX: number): number => {
		if (!trackRef.current) return position;
		const rect = trackRef.current.getBoundingClientRect();
		const handleWidth = 20;
		const padding = 3;
		const trackWidth = rect.width - handleWidth - (padding * 2);
		const trackLeft = rect.left + padding;
		const relativeX = clientX - trackLeft - (handleWidth / 2);
		return Math.max(0, Math.min(1, relativeX / trackWidth));
	}, [position]);

	const handleDragStart = useCallback((clientX: number) => {
		setIsDragging(true);
		dragStartRef.current = { x: clientX, startPosition: position };
	}, [position]);

	const handleDragMove = useCallback((clientX: number) => {
		if (!isDragging || !dragStartRef.current) return;
		const newPosition = calculatePosition(clientX);
		setPosition(newPosition);
	}, [isDragging, calculatePosition]);

	const handleDragEnd = useCallback(() => {
		if (!isDragging) return;
		setIsDragging(false);
		dragStartRef.current = null;
		const shouldBeOn = position > 0.5;
		setPosition(shouldBeOn ? 1 : 0);
		if (shouldBeOn !== checked) {
			onToggle();
		}
	}, [isDragging, position, checked, onToggle]);

	useEffect(() => {
		if (!isDragging) return;
		const handleMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			handleDragMove(e.clientX);
		};
		const handleTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			handleDragMove(e.touches[0].clientX);
		};
		const handleMouseUp = () => handleDragEnd();
		const handleTouchEnd = () => handleDragEnd();
		
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("touchmove", handleTouchMove, { passive: false });
		document.addEventListener("touchend", handleTouchEnd);
		
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [isDragging, handleDragMove, handleDragEnd]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onToggle();
	};

	const handleWidth = 20;
	const padding = 3;
	const handleLeft = `calc(${padding}px + ${position} * (100% - ${handleWidth}px - ${padding * 2}px))`;

	return (
		<div
			ref={trackRef}
			onClick={handleClick}
			style={{
				position: "relative",
				width: "56px",
				height: "28px",
				borderRadius: "14px",
				background: position > 0.5 
					? "rgba(78, 5, 6, 0.4)"  // Maroon when on
					: "rgba(255, 255, 255, 0.1)",
				border: "1px solid rgba(255, 255, 255, 0.15)",
				cursor: "pointer",
				transition: "background 0.3s ease",
				flexShrink: 0,
			}}
		>
			<div
				onMouseDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
					handleDragStart(e.clientX);
				}}
				onTouchStart={(e) => {
					e.stopPropagation();
					handleDragStart(e.touches[0].clientX);
				}}
				style={{
					position: "absolute",
					top: "50%",
					left: handleLeft,
					transform: "translateY(-50%)",
					width: handleWidth,
					height: "22px",
					borderRadius: "11px",
					background: position > 0.5 
						? "rgba(255, 255, 255, 0.9)"
						: "rgba(255, 255, 255, 0.6)",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
					cursor: isDragging ? "grabbing" : "grab",
					transition: isDragging ? "none" : "left 0.3s ease, background 0.3s ease",
				}}
			/>
		</div>
	);
}

/**
 * Toggle row with slider
 */
function ToggleRow({ item, checked, onToggle }: {
	item: ToggleItem;
	checked: boolean;
	onToggle: () => void;
}) {
	return (
		<div style={{ 
			display: "flex", 
			alignItems: "center", 
			justifyContent: "space-between", 
			paddingTop: "8px",
			paddingBottom: "8px",
			gap: "12px",
		}}>
			<div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
				<span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255, 255, 255, 0.9)" }}>
					{item.label}
				</span>
				{item.description && (
					<span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{item.description}
					</span>
				)}
			</div>
			<ToggleSlider checked={checked} onToggle={onToggle} />
		</div>
	);
}

/**
 * Section header component
 */
function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
	return (
		<div style={{ 
			marginBottom: "8px", 
			paddingBottom: "8px", 
			borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
			marginTop: "16px",
		}}>
			<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
				{icon}
				<span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>
					{title}
				</span>
			</div>
		</div>
	);
}

/**
 * Glass-styled debug menu with slider toggles
 * On mobile: slides in from left with all debug options
 * On desktop: dropdown menu from button
 */
export function GlassDebugMenu({
	orbs = [],
	targetOrbCount,
	selectedOrbId,
	selectedOrb: selectedOrbProp,
	orbSize = DEFAULT_ORB_SPAWN_CONFIG.defaultSize,
	onSelectOrb,
	onDeleteOrb,
	onSizeChange,
	gridConfig,
	viewportCells,
	currentLayer = 0,
	onLayerChange,
	hoveredCell,
}: GlassDebugMenuProps) {
	const debugContext = useDebugSafe();
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isDebugEnabled, setIsDebugEnabled] = useState(false);
	const [localState, setLocalState] = useState<Omit<DebugState, "enabled">>(defaultState);
	const [isMobile, setIsMobile] = useState(false);

	// Use real-time prop if available, otherwise find in list
	const selectedOrb = selectedOrbProp || orbs.find((o) => o.id === selectedOrbId);
	const { minSize, maxSize } = DEFAULT_ORB_SPAWN_CONFIG;

	useEffect(() => {
		setMounted(true);
		
		// Check if mobile
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem("debug-mode-enabled");
			setIsDebugEnabled(stored === "true");
		}
		
		const handleDebugModeChange = (e: CustomEvent) => {
			setIsDebugEnabled(e.detail.enabled);
		};
		
		const checkDebugMode = () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem("debug-mode-enabled");
				setIsDebugEnabled(stored === "true");
			}
		};
		
		window.addEventListener("debugModeChanged", handleDebugModeChange as EventListener);
		window.addEventListener("storage", checkDebugMode);
		
		return () => {
			window.removeEventListener("resize", checkMobile);
			window.removeEventListener("debugModeChanged", handleDebugModeChange as EventListener);
			window.removeEventListener("storage", checkDebugMode);
		};
	}, []);

	const handleToggle = useCallback((key: keyof Omit<DebugState, "enabled">) => {
		if (debugContext) {
			debugContext.toggle(key);
		} else {
			setLocalState(prev => {
				const newState = { ...prev, [key]: !prev[key] };
				// Defer event dispatch to avoid setState during render
				queueMicrotask(() => {
					window.dispatchEvent(
						new CustomEvent("debugOptionChanged", { 
							detail: { key, value: newState[key] } 
						})
					);
				});
				return newState;
			});
		}
	}, [debugContext]);

	if (!mounted) return null;

	const debugEnabled = debugContext?.state.enabled || isDebugEnabled;
	if (!debugEnabled) return null;

	const state = debugContext?.state || { ...localState, enabled: true };

	const glassStyles: React.CSSProperties = {
		background: "rgba(255, 255, 255, 0.08)",
		backdropFilter: "blur(24px) saturate(120%)",
		WebkitBackdropFilter: "blur(24px) saturate(120%)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: `
			0 25px 50px rgba(0, 0, 0, 0.25),
			0 10px 20px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1)
		`,
	};

	// Mobile: Slide-in panel from left
	if (isMobile) {
		return (
			<>
				{/* Toggle Button - Fixed position */}
				<button
					onClick={() => setIsOpen(!isOpen)}
					style={{
						...glassStyles,
						position: "fixed",
						top: "16px",
						left: "16px",
						zIndex: 10001,
						width: "44px",
						height: "44px",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						cursor: "pointer",
						transition: "transform 0.2s",
					}}
					aria-label={isOpen ? "Close debug menu" : "Open debug menu"}
				>
					{isOpen ? (
						<X style={{ width: "22px", height: "22px", color: "rgba(255, 255, 255, 0.8)" }} />
					) : (
						<ChevronRight style={{ width: "22px", height: "22px", color: "rgba(255, 255, 255, 0.8)" }} />
					)}
				</button>

				{/* Backdrop */}
				{isOpen && (
					<div
						onClick={() => setIsOpen(false)}
						style={{
							position: "fixed",
							inset: 0,
							background: "rgba(0, 0, 0, 0.5)",
							zIndex: 9999,
						}}
					/>
				)}

				{/* Slide-in Panel */}
				<div
					style={{
						...glassStyles,
						position: "fixed",
						top: 0,
						left: 0,
						bottom: 0,
						width: "min(320px, 85vw)",
						zIndex: 10000,
						transform: isOpen ? "translateX(0)" : "translateX(-100%)",
						transition: "transform 0.3s ease",
						overflowY: "auto",
						fontFamily: "var(--font-mono), monospace",
						padding: "16px",
						paddingTop: "72px", // Space for button
					}}
				>
					{/* Debug Options Section */}
					<div style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<Settings style={{ width: "14px", height: "14px", color: "rgba(255, 255, 255, 0.7)" }} />
							<span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>
								Debug Options
							</span>
						</div>
					</div>

					<div style={{ display: "flex", flexDirection: "column" }}>
						{toggleItems.map((item) => (
							<ToggleRow
								key={item.key}
								item={item}
								checked={state[item.key]}
								onToggle={() => handleToggle(item.key)}
							/>
						))}
					</div>

					{/* Grid Stats Section */}
					{gridConfig && viewportCells && (
						<>
							<SectionHeader title="Grid Stats" />
							
							<div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
								<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Grid:</span>
								<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
									{gridConfig.cellsX}×{gridConfig.cellsY}×{gridConfig.layers}
								</span>
							</div>

							<div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
								<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cell:</span>
								<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
									{viewportCells.cellSizeXCm.toFixed(2)}×{viewportCells.cellSizeYCm.toFixed(2)}cm
								</span>
							</div>

							<div style={{ marginBottom: 8, fontSize: 11 }}>
								<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
									<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Z:</span>
									<input
										type="range"
										min={0}
										max={gridConfig.layers - 1}
										value={currentLayer}
										onChange={(e) => onLayerChange?.(parseInt(e.target.value))}
										style={{ 
											flex: 1,
											cursor: 'pointer',
											accentColor: 'rgba(78, 5, 6, 0.8)',
										}}
									/>
									<span style={{ minWidth: 16, textAlign: 'right', color: 'rgba(255, 255, 255, 0.9)' }}>
										{currentLayer}
									</span>
								</label>
							</div>

							{hoveredCell && (
								<div style={{ color: 'rgba(136, 255, 136, 0.9)', fontSize: 10, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
									Cell ({hoveredCell.x}, {hoveredCell.y})
									<br />
									{hoveredCell.worldX.toFixed(1)}cm, {hoveredCell.worldY.toFixed(1)}cm
								</div>
							)}
						</>
					)}

					{/* Orb Debug Section */}
					{orbs.length > 0 && (
						<>
							<SectionHeader title={`Orb Debug (${orbs.length}${targetOrbCount ? ` / ${targetOrbCount}` : ''})`} />
							
							{/* Orb Selector */}
							<div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
								<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
									<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select:</span>
									<select
										value={selectedOrbId || ''}
										onChange={(e) => onSelectOrb?.(e.target.value || null)}
										style={{
											background: 'rgba(255, 255, 255, 0.1)',
											color: 'rgba(255, 255, 255, 0.9)',
											border: '1px solid rgba(255, 255, 255, 0.15)',
											borderRadius: 6,
											fontSize: 10,
											padding: '4px 6px',
											maxWidth: 120,
											cursor: 'pointer',
										}}
									>
										<option value="">None</option>
										{orbs.map((orb, i) => (
											<option key={orb.id} value={orb.id}>
												Orb {i + 1} ({orb.size})
											</option>
										))}
									</select>
								</label>
							</div>

							{/* Selected Orb Info */}
							{selectedOrb && (
								<div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', padding: '8px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
									Pos: {selectedOrb.pxX.toFixed(0)}, {selectedOrb.pxY.toFixed(0)}, z={selectedOrb.z.toFixed(1)}
									<br />
									Size: {selectedOrb.size} | Speed: {selectedOrb.speed.toFixed(1)} px/s
									<br />
									Vel: vx={selectedOrb.vx.toFixed(1)}, vy={selectedOrb.vy.toFixed(1)}, vz={selectedOrb.vz.toFixed(2)}
								</div>
							)}

							{/* Delete Button */}
							<div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
								<button
									onClick={() => selectedOrbId && onDeleteOrb?.(selectedOrbId)}
									style={{
										flex: 1,
										background: 'rgba(170, 17, 17, 0.6)',
										color: 'rgba(255, 255, 255, 0.9)',
										border: '1px solid rgba(255, 255, 255, 0.15)',
										borderRadius: 6,
										padding: '6px 4px',
										fontSize: 10,
										cursor: selectedOrbId ? 'pointer' : 'not-allowed',
										opacity: selectedOrbId ? 1 : 0.5,
									}}
									disabled={!selectedOrbId}
								>
									Delete Selected
								</button>
							</div>

							{/* Brush Size Slider */}
							<div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
								<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Brush Size:</span>
									<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{orbSize}</span>
								</label>
								<input
									type="range"
									min={minSize}
									max={maxSize}
									step={1}
									value={orbSize}
									onChange={(e) => onSizeChange?.(parseInt(e.target.value, 10))}
									style={{ 
										width: '100%', 
										cursor: 'pointer',
										accentColor: 'rgba(78, 5, 6, 0.8)',
									}}
								/>
							</div>

							<div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic', marginTop: 8 }}>
								* Tap grid to place orb
							</div>
						</>
					)}
				</div>
			</>
		);
	}

	// Desktop: Dropdown menu
	return (
		<div
			style={{
				position: "fixed",
				top: "16px",
				left: "16px",
				zIndex: 9999,
				fontFamily: "var(--font-mono), monospace",
			}}
		>
			<button
				onClick={() => setIsOpen(!isOpen)}
				style={{
					...glassStyles,
					width: "40px",
					height: "40px",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					transition: "transform 0.2s",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = "scale(1.05)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "scale(1)";
				}}
				aria-label={isOpen ? "Close debug menu" : "Open debug menu"}
			>
				{isOpen ? (
					<X style={{ width: "20px", height: "20px", color: "rgba(255, 255, 255, 0.8)" }} />
				) : (
					<Settings style={{ width: "20px", height: "20px", color: "rgba(255, 255, 255, 0.8)" }} />
				)}
			</button>

			{isOpen && (
				<div
					style={{
						...glassStyles,
						position: "absolute",
						top: "48px",
						left: "0",
						width: "280px",
						borderRadius: "12px",
						padding: "12px",
						maxHeight: "calc(100vh - 80px)",
						overflowY: "auto",
					}}
				>
					<div style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<Settings style={{ width: "14px", height: "14px", color: "rgba(255, 255, 255, 0.7)" }} />
							<span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>
								Debug Options
							</span>
						</div>
					</div>

					<div style={{ display: "flex", flexDirection: "column" }}>
						{toggleItems.map((item) => (
							<ToggleRow
								key={item.key}
								item={item}
								checked={state[item.key]}
								onToggle={() => handleToggle(item.key)}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
