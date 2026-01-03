"use client";

// =============================================================================
// OrbDebugPanel - UI for orb system debugging
// =============================================================================

import { type Orb } from '../../orb/types';

interface OrbDebugPanelProps {
	/** Current list of orbs in the system */
	orbs?: Orb[];
	/** Currently selected orb ID */
	selectedOrbId?: string | null;
	/** Currently selected orb data (for real-time updates) */
	selectedOrb?: Orb | null;
	/** Current orb size in centimeters */
	orbSize?: number;
	/** Optional callback when an orb is selected */
	onSelectOrb?: (id: string | null) => void;
	/** Optional callback when an orb is deleted */
	onDeleteOrb?: (id: string) => void;
	/** Optional callback when the orb size slider changes */
	onSizeChange?: (size: number) => void;
}

/**
 * Debug panel for managing orbs.
 * Displays information about placed orbs and allows basic manipulation.
 */
export function OrbDebugPanel({
	orbs = [],
	selectedOrbId,
	selectedOrb: selectedOrbProp,
	orbSize = 1,
	onSelectOrb,
	onDeleteOrb,
	onSizeChange
}: OrbDebugPanelProps) {
	const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSize = parseInt(e.target.value, 10);
		onSizeChange?.(newSize);
	};

	// Use real-time prop if available, otherwise find in list
	const selectedOrb = selectedOrbProp || orbs.find(o => o.id === selectedOrbId);

	return (
		<div style={{
			padding: 12,
			background: 'rgba(0,0,0,0.7)',
			border: '1px solid #333',
			borderRadius: 6,
			color: 'white',
			fontFamily: 'monospace',
			fontSize: 11,
			backdropFilter: 'blur(4px)',
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
			minWidth: 180
		}}>
			<div style={{ fontWeight: 'bold', borderBottom: '1px solid #444', paddingBottom: 4, marginBottom: 4 }}>
				Orb Debug ({orbs.length})
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<strong>Select:</strong>
					<select 
						value={selectedOrbId || ''} 
						onChange={(e) => onSelectOrb?.(e.target.value || null)}
						style={{ background: '#222', color: '#fff', border: '1px solid #444', fontSize: 10, padding: '2px 4px', maxWidth: 100 }}
					>
						<option value="">None</option>
						{orbs.map((orb, i) => (
							<option key={orb.id} value={orb.id}>
								Orb {i + 1} ({orb.size.toFixed(0)})
							</option>
						))}
					</select>
				</label>
			</div>

			{selectedOrb && (
				<div style={{ fontSize: 10, color: '#aaa', padding: '4px 0', borderTop: '1px solid #333' }}>
					Pos: {selectedOrb.pxX.toFixed(0)}, {selectedOrb.pxY.toFixed(0)}px<br/>
					Layer: {selectedOrb.layer} | Size: {selectedOrb.size}<br/>
					Speed: {selectedOrb.speed.toFixed(1)} px/s
				</div>
			)}

			<div style={{ display: 'flex', gap: 4 }}>
				<button 
					onClick={() => onDeleteOrb?.(selectedOrbId!)}
					style={{ flex: 1, background: '#a11', color: 'white', border: 'none', borderRadius: 3, padding: '4px 2px', fontSize: 9, cursor: 'pointer' }}
					disabled={!selectedOrbId}
				>
					Delete Selected
				</button>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<strong>Brush Size:</strong>
					<span>{orbSize.toFixed(0)}</span>
				</label>
				<input 
					type="range" 
					min="1" 
					max="10" 
					step="1" 
					value={orbSize} 
					onChange={handleSizeChange}
					style={{ width: '100%', cursor: 'pointer' }}
				/>
			</div>
			
			<div style={{ fontSize: 9, color: '#888', fontStyle: 'italic', marginTop: 4 }}>
				* Click grid to place orb object
			</div>
		</div>
	);
}
