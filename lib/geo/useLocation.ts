'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  heading: number | null; // Direction user is moving (degrees from north)
  speed: number | null;   // Speed in m/s
}

export interface LocationError {
  code: number;
  message: string;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function useLocation(options: UseLocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = true,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  
  const watchIdRef = useRef<number | null>(null);

  const handlePosition = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      heading: position.coords.heading,
      speed: position.coords.speed,
    });
    setError(null);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setError({
      code: error.code,
      message: error.message,
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsTracking(true);

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        geoOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handlePosition,
        handleError,
        geoOptions
      );
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch, handlePosition, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (watch) {
      startTracking();
    }
  }, [watch, startTracking]);

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}
