'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface DeviceOrientationData {
  alpha: number | null; // Rotation around z-axis (0-360)
  beta: number | null;  // Front-to-back rotation (-180 to 180)
  gamma: number | null; // Left-to-right rotation (-90 to 90)
  heading: number | null; // Compass heading (0-360, null if unavailable)
  absolute: boolean;
  available: boolean; // Whether device orientation API is available
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationData>({
    alpha: null,
    beta: null,
    gamma: null,
    heading: null,
    absolute: false,
    available: false,
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleOrientation = useCallback((event: DeviceOrientationEvent | any) => {    
    // Try to get compass heading from different sources
    let heading: number | null = null;
    let isAbsolute = event.absolute;

    // webkitCompassHeading is available on iOS Safari
    const iosHeading = event.webkitCompassHeading;
    if (iosHeading !== undefined && iosHeading !== null) {
      heading = iosHeading;
      isAbsolute = true;
    }
    // For Android/other
    else if (event.alpha !== null) {
      // On Android Chrome, absolute is false for deviceorientation, but true for deviceorientationabsolute 
      // (or at least it's the absolute event).
      // We will prefer the event if it's absolute, or if it's the specific absolute event.
      if (event.type === 'deviceorientationabsolute') {
        isAbsolute = true;
      }

      heading = (360 - event.alpha) % 360;
    }

    setOrientation((prev) => {
      // If we already have an absolute reading and this event is relative, don't overwrite the heading!
      if (prev.absolute && !isAbsolute) {
        return prev;
      }
      return {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        heading,
        absolute: isAbsolute,
        available: true,
      };
    });
  }, []);

  const handleError = useCallback((err: any) => {
    setError(err.message || 'Failed to access device orientation');
    setOrientation((prev) => ({ ...prev, available: false }));
  }, []);

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission
    const DeviceOrientationEvent = (window as any).DeviceOrientationEvent;

    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
          return true;
        } else {
          setError('Permission denied for device orientation');
          return false;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to request orientation permission');
        return false;
      }
    } else {
      // Non-iOS devices: just add listener
      setPermissionGranted(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      return true;
    }
  }, [handleOrientation]);

  const removeListener = useCallback(() => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [handleOrientation]);

  useEffect(() => {
    return () => {
      removeListener();
    };
  }, [removeListener]);

  return {
    orientation,
    permissionGranted,
    error,
    requestPermission,
    removeListener,
  };
}
