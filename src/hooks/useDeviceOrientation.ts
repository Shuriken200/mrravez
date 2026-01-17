import { useEffect, useState, useRef } from "react";

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between current and target
 */
function lerp(current: number, target: number, factor: number): number {
	return current + (target - current) * factor;
}

interface DeviceOrientation {
	tiltX: number;       // Calibrated: 0.5 = initial position
	tiltY: number;       // Calibrated: 0.5 = initial position
	rawTiltX: number;    // Absolute: 0.5 = device flat
	rawTiltY: number;    // Absolute: 0.5 = device flat
	hasPermission: boolean;
}

// Smoothing factor for interpolation (lower = smoother but laggier)
const SMOOTHING_FACTOR = 0.12;

export function useDeviceOrientation(): DeviceOrientation {
	const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
	const [hasPermission, setHasPermission] = useState(false);

	// Target values from device orientation events (raw, unsmoothed)
	const targetOrientationRef = useRef({ beta: 0, gamma: 0 });

	// Smoothed values for rendering (interpolated via RAF)
	const smoothedOrientationRef = useRef({ beta: 0, gamma: 0 });

	// State to store initial orientation for calibration (null until first reading)
	const [initialOrientation, setInitialOrientation] = useState<{ beta: number; gamma: number } | null>(null);

	// RAF loop ID for cleanup
	const rafIdRef = useRef<number | null>(null);

	useEffect(() => {
		const handleOrientation = (e: DeviceOrientationEvent) => {
			if (e.beta === null || e.gamma === null) return;

			// Capture initial orientation on first valid reading
			if (initialOrientation === null) {
				const initialBeta = clamp(e.beta, -90, 90);
				const initialGamma = clamp(e.gamma, -45, 45);

				setInitialOrientation({
					beta: initialBeta,
					gamma: initialGamma,
				});

				// Initialize smoothed values to initial position
				smoothedOrientationRef.current = {
					beta: initialBeta,
					gamma: initialGamma,
				};
				targetOrientationRef.current = {
					beta: initialBeta,
					gamma: initialGamma,
				};
			}

			// Update target values (these will be smoothly interpolated to)
			targetOrientationRef.current = {
				beta: clamp(e.beta, -90, 90),
				gamma: clamp(e.gamma, -45, 45),
			};
		};

		// Smoothing loop using requestAnimationFrame
		const smoothingLoop = () => {
			const target = targetOrientationRef.current;
			const current = smoothedOrientationRef.current;

			// Interpolate toward target values
			current.beta = lerp(current.beta, target.beta, SMOOTHING_FACTOR);
			current.gamma = lerp(current.gamma, target.gamma, SMOOTHING_FACTOR);

			// Update state with smoothed values
			setOrientation({ beta: current.beta, gamma: current.gamma });

			// Continue loop
			rafIdRef.current = requestAnimationFrame(smoothingLoop);
		};

		const requestPermission = async () => {
			// iOS 13+ requires permission for DeviceOrientationEvent
			const DOE = DeviceOrientationEvent as unknown as {
				new(): DeviceOrientationEvent;
				requestPermission?: () => Promise<'granted' | 'denied'>;
			};

			if (typeof DeviceOrientationEvent !== 'undefined' && DOE.requestPermission) {
				try {
					const permission = await DOE.requestPermission();
					if (permission === 'granted') {
						setHasPermission(true);
						window.addEventListener('deviceorientation', handleOrientation);
						// Start smoothing loop
						rafIdRef.current = requestAnimationFrame(smoothingLoop);
					}
				} catch { }
			} else if (typeof DeviceOrientationEvent !== 'undefined') {
				setHasPermission(true);
				window.addEventListener('deviceorientation', handleOrientation);
				// Start smoothing loop
				rafIdRef.current = requestAnimationFrame(smoothingLoop);
			}
		};

		const handleFirstTouch = () => {
			requestPermission();
			window.removeEventListener('touchstart', handleFirstTouch);
		};

		window.addEventListener('touchstart', handleFirstTouch);
		requestPermission();

		return () => {
			window.removeEventListener('deviceorientation', handleOrientation);
			window.removeEventListener('touchstart', handleFirstTouch);
			if (rafIdRef.current) {
				cancelAnimationFrame(rafIdRef.current);
			}
		};
	}, [initialOrientation]);

	// Calculate raw tilt values (absolute, 0.5 = device flat)
	const rawTiltX = (orientation.gamma + 45) / 90;
	const rawTiltY = (orientation.beta + 90) / 180;

	// Calculate calibrated tilt values (relative to initial position)
	let tiltX = rawTiltX;
	let tiltY = rawTiltY;

	if (initialOrientation !== null) {
		// Calculate offset from initial position
		const initialX = (initialOrientation.gamma + 45) / 90;
		const initialY = (initialOrientation.beta + 90) / 180;

		// Center around initial position (initial = 0.5)
		const offsetX = rawTiltX - initialX;
		const offsetY = rawTiltY - initialY;

		// Re-center to 0.5 and clamp to 0-1 range
		tiltX = clamp(0.5 + offsetX, 0, 1);
		tiltY = clamp(0.5 + offsetY, 0, 1);
	}

	return { tiltX, tiltY, rawTiltX, rawTiltY, hasPermission };
}
