'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { Polyline, useMap } from 'react-leaflet';
import type { MapRoute } from '../types';

function RouteFitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length === 0) {
      return;
    }

    map.fitBounds(L.latLngBounds(coordinates), { padding: [72, 72] });
  }, [coordinates, map]);

  return null;
}

interface MapRouteLayerProps {
  route: MapRoute;
}

export function MapRouteLayer({ route }: MapRouteLayerProps) {
  return (
    <>
      <RouteFitBounds coordinates={route.coordinates} />
      <Polyline
        positions={route.coordinates}
        pathOptions={{ color: '#0f766e', weight: 5, opacity: 0.9 }}
      />
    </>
  );
}
