"use client";

// =============================================================================
// useOrbSelection - Orb selection state management
// =============================================================================

import { useState, useCallback, useRef, useMemo } from 'react';
import { type Orb } from '../types';

/**
 * Return values from the orb selection hook.
 */
export interface UseOrbSelectionReturn {
	/** Currently selected orb ID. */
	selectedOrbId: string | null;
	/** Currently selected orb data (real-time snapshot). */
	selectedOrbData: Orb | null;
	/** Ref for stable access to selected orb ID in loops. */
	selectedOrbIdRef: React.RefObject<string | null>;
	/** Selects an orb by ID (null to deselect). */
	selectOrb: (id: string | null, orbsRef: React.RefObject<Orb[]>) => void;
	/** Updates the selected orb data snapshot from orbsRef. */
	updateSelectedOrbData: (orbsRef: React.RefObject<Orb[]>) => void;
}

/**
 * Hook for managing orb selection state.
 * 
 * Single Responsibility: Orb selection state only.
 */
export function useOrbSelection(): UseOrbSelectionReturn {
	const [selectedOrbId, setSelectedOrbId] = useState<string | null>(null);
	const [selectedOrbData, setSelectedOrbData] = useState<Orb | null>(null);
	const selectedOrbIdRef = useRef<string | null>(null);

	const selectOrb = useCallback((id: string | null, orbsRef: React.RefObject<Orb[]>) => {
		setSelectedOrbId(id);
		selectedOrbIdRef.current = id;
		if (id) {
			const found = orbsRef.current.find(o => o.id === id);
			setSelectedOrbData(found ? { ...found } : null);
		} else {
			setSelectedOrbData(null);
		}
	}, []);

	const updateSelectedOrbData = useCallback((orbsRef: React.RefObject<Orb[]>) => {
		if (selectedOrbIdRef.current) {
			const found = orbsRef.current.find(o => o.id === selectedOrbIdRef.current);
			if (found) {
				setSelectedOrbData({ ...found });
			}
		}
	}, []);

	return useMemo(() => ({
		selectedOrbId,
		selectedOrbData,
		selectedOrbIdRef,
		selectOrb,
		updateSelectedOrbData,
	}), [selectedOrbId, selectedOrbData, selectOrb, updateSelectedOrbData]);
}
