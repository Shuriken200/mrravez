import { useEffect, useState, useRef } from "react";

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

interface DeviceOrientation {
    tiltX: number;
    tiltY: number;
    hasPermission: boolean;
}

// Throttle interval in ms (20fps = 50ms between updates)
const THROTTLE_INTERVAL_MS = 50;

export function useDeviceOrientation(): DeviceOrientation {
    const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
    const [hasPermission, setHasPermission] = useState(false);
    
    // Ref to track last update time for throttling
    const lastUpdateRef = useRef<number>(0);
    // Ref to store pending orientation data
    const pendingOrientationRef = useRef<{ beta: number; gamma: number } | null>(null);
    // Ref for throttle timeout
    const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta === null || e.gamma === null) return;
            
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateRef.current;
            
            // Store the latest orientation data
            pendingOrientationRef.current = {
                beta: clamp(e.beta, -45, 45),
                gamma: clamp(e.gamma, -45, 45),
            };
            
            // If enough time has passed, update immediately
            if (timeSinceLastUpdate >= THROTTLE_INTERVAL_MS) {
                lastUpdateRef.current = now;
                setOrientation(pendingOrientationRef.current);
                pendingOrientationRef.current = null;
                
                // Clear any pending timeout
                if (throttleTimeoutRef.current) {
                    clearTimeout(throttleTimeoutRef.current);
                    throttleTimeoutRef.current = null;
                }
            } else if (!throttleTimeoutRef.current) {
                // Schedule an update for when the throttle period ends
                const delay = THROTTLE_INTERVAL_MS - timeSinceLastUpdate;
                throttleTimeoutRef.current = setTimeout(() => {
                    if (pendingOrientationRef.current) {
                        lastUpdateRef.current = Date.now();
                        setOrientation(pendingOrientationRef.current);
                        pendingOrientationRef.current = null;
                    }
                    throttleTimeoutRef.current = null;
                }, delay);
            }
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
                    }
                } catch { }
            } else if (typeof DeviceOrientationEvent !== 'undefined') {
                setHasPermission(true);
                window.addEventListener('deviceorientation', handleOrientation);
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
            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
            }
        };
    }, []);
    
    const tiltX = (orientation.gamma + 45) / 90;
    const tiltY = (orientation.beta + 45) / 90;
    
    return { tiltX, tiltY, hasPermission };
}
