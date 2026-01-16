"use client";

// =============================================================================
// OrbDebugPanel - Debug UI for Orb System Management
// =============================================================================

import { type Orb } from '../../orb/types';
import { DEFAULT_ORB_SPAWN_CONFIG } from '../../orb/config';

/**
 * Props for the OrbDebugPanel component.
 */
interface OrbDebugPanelProps {
	/** Current list of orbs in the system. */
	orbs?: Orb[];
	/** Target orb count (scales with screen size). */
	targetOrbCount?: number;
	/** Currently selected orb ID. */
	selectedOrbId?: string | null;
	/** Real-time data for the selected orb. */
	selectedOrb?: Orb | null;
	/** Current brush size for new orbs. */
	orbSize?: number;
	/** Whether physics is paused. */
	isPaused?: boolean;
	/** Callback when an orb is selected. */
	onSelectOrb?: (id: string | null) => void;
	/** Callback when an orb is deleted. */
	onDeleteOrb?: (id: string) => void;
	/** Callback when the brush size changes. */
	onSizeChange?: (size: number) => void;
	/** Callback to toggle pause state. */
	onTogglePause?: () => void;
}

/**
 * Debug panel for managing orbs.
 *
 * Features:
 * - Orb selector dropdown
 * - Real-time position and velocity display
 * - Delete button for selected orb
 * - Brush size slider for new orbs
 * - Pause/Resume physics button
 *
 * Only visible when debug mode is enabled.
 */
export function OrbDebugPanel({
	orbs = [],
	targetOrbCount,
	selectedOrbId,
	selectedOrb: selectedOrbProp,
	orbSize = DEFAULT_ORB_SPAWN_CONFIG.defaultSize,
	isPaused = false,
	onSelectOrb,
	onDeleteOrb,
	onSizeChange,
	onTogglePause,
}: OrbDebugPanelProps) {
	const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSize = parseInt(e.target.value, 10);
		onSizeChange?.(newSize);
	};

	// Use real-time prop if available, otherwise find in list
	const selectedOrb = selectedOrbProp || orbs.find((o) => o.id === selectedOrbId);

	const { minSize, maxSize } = DEFAULT_ORB_SPAWN_CONFIG;

	return (
		<div
			style={{
				padding: 12,
				background: 'rgba(0, 0, 0, 0.7)',
				border: '1px solid #333',
				borderRadius: 6,
				color: 'white',
				fontFamily: 'monospace',
				fontSize: 11,
				backdropFilter: 'blur(4px)',
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
				minWidth: 180,
			}}
		>
			<div
				style={{
					fontWeight: 'bold',
					borderBottom: '1px solid #444',
					paddingBottom: 4,
					marginBottom: 4,
				}}
			>
				Orb Debug ({orbs.length}{targetOrbCount ? ` / ${targetOrbCount}` : ''})
			</div>

			{/* Orb Selector */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<strong>Select:</strong>
					<select
						value={selectedOrbId || ''}
						onChange={(e) => onSelectOrb?.(e.target.value || null)}
						style={{
							background: '#222',
							color: '#fff',
							border: '1px solid #444',
							fontSize: 10,
							padding: '2px 4px',
							maxWidth: 100,
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
				<div
					style={{
						fontSize: 10,
						color: '#aaa',
						padding: '4px 0',
						borderTop: '1px solid #333',
					}}
				>
					Pos: {selectedOrb.pxX.toFixed(0)}, {selectedOrb.pxY.toFixed(0)}, z={selectedOrb.z.toFixed(1)}
					<br />
					Size: {selectedOrb.size} | Speed: {selectedOrb.speed.toFixed(1)} px/s
					<br />
					Vel: vx={selectedOrb.vx.toFixed(1)}, vy={selectedOrb.vy.toFixed(1)}, vz={selectedOrb.vz.toFixed(2)}
				</div>
			)}

			{/* Pause/Resume Button */}
			<div style={{ display: 'flex', gap: 4 }}>
				<button
					onClick={() => onTogglePause?.()}
					style={{
						flex: 1,
						background: isPaused ? '#4a4' : '#a44',
						color: 'white',
						border: 'none',
						borderRadius: 3,
						padding: '6px 2px',
						fontSize: 10,
						fontWeight: 'bold',
						cursor: 'pointer',
					}}
				>
					{isPaused ? '▶ Resume' : '⏸ Pause'}
				</button>
			</div>

			{/* Delete Button */}
			<div style={{ display: 'flex', gap: 4 }}>
				<button
					onClick={() => onDeleteOrb?.(selectedOrbId!)}
					style={{
						flex: 1,
						background: '#a11',
						color: 'white',
						border: 'none',
						borderRadius: 3,
						padding: '4px 2px',
						fontSize: 9,
						cursor: 'pointer',
					}}
					disabled={!selectedOrbId}
				>
					Delete Selected
				</button>
			</div>

			{/* Brush Size Slider */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<strong>Brush Size:</strong>
					<span>{orbSize}</span>
				</label>
				<input
					type="range"
					min={minSize}
					max={maxSize}
					step={1}
					value={orbSize}
					onChange={handleSizeChange}
					style={{ width: '100%', cursor: 'pointer' }}
				/>
			</div>

			<div style={{ fontSize: 9, color: '#888', fontStyle: 'italic', marginTop: 4 }}>
				* Click grid to place orb
			</div>
		</div>
	);
}
