'use client';

import { useEffect, useState } from 'react';

export type GeolocationState =
  | { status: 'loading' }
  | { status: 'success'; position: [number, number] }
  | { status: 'error'; message: string };

const FALLBACK_CENTER: [number, number] = [35.6892, 51.389];

export function useGeolocation(): GeolocationState & {
  fallbackCenter: [number, number];
} {
  const [state, setState] = useState<GeolocationState>({ status: 'loading' });

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => {
        setState({
          status: 'error',
          message: 'Geolocation is not supported on this device.',
        });
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          position: [position.coords.latitude, position.coords.longitude],
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. Enable it in browser settings.'
            : error.code === error.TIMEOUT
              ? 'Location request timed out. Try again.'
              : 'Unable to determine your location.';

        setState({ status: 'error', message });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  }, []);

  return { ...state, fallbackCenter: FALLBACK_CENTER };
}
