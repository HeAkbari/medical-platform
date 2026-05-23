'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/use-geolocation';

const DEFAULT_ZOOM = 15;

function createMarkerIcon() {
  return L.icon({
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, DEFAULT_ZOOM, { duration: 0.8 });
  }, [map, position]);

  return null;
}

export function LeafletMap() {
  const geo = useGeolocation();
  const markerIcon = useMemo(() => createMarkerIcon(), []);

  if (geo.status === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-600">
        Getting your location...
      </div>
    );
  }

  const center =
    geo.status === 'success' ? geo.position : geo.fallbackCenter;
  const showUserMarker = geo.status === 'success';

  return (
    <div className="relative h-full w-full">
      {geo.status === 'error' ? (
        <div className="absolute inset-x-4 top-4 z-[1000] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          {geo.message}
        </div>
      ) : null}

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full [&_.leaflet-control-zoom_a]:min-h-11 [&_.leaflet-control-zoom_a]:min-w-11"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {showUserMarker ? (
          <>
            <MapRecenter position={geo.position} />
            <Marker position={geo.position} icon={markerIcon}>
              <Popup>You are here</Popup>
            </Marker>
          </>
        ) : null}
      </MapContainer>
    </div>
  );
}
