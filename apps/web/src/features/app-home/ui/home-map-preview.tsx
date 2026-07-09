'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '@/hooks/use-geolocation';

const PREVIEW_ZOOM = 13;

const OSM_TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
} as const;

function createUserMarkerIcon() {
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

function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
}

export function HomeMapPreview() {
  const geo = useGeolocation();
  const userMarkerIcon = useMemo(() => createUserMarkerIcon(), []);
  const userPosition = geo.status === 'success' ? geo.position : null;
  const center = userPosition ?? geo.fallbackCenter;

  return (
    <div className="leaflet-map h-full w-full">
      <MapContainer
        center={center}
        zoom={PREVIEW_ZOOM}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url={OSM_TILE_LAYER.url} maxZoom={19} />
        <MapInvalidateSize />
        {userPosition ? (
          <Marker
            position={userPosition}
            icon={userMarkerIcon}
            interactive={false}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
