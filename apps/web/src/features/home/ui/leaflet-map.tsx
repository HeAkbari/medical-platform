'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useFilteredMapFacilities } from '@/features/map/hooks/use-filtered-map-facilities';
import { useMapNavigationStore } from '@/features/map/store/map-navigation-store';
import { useMapFacilityDrawerStore } from '@/features/map/store/map-facility-drawer-store';
import { FacilityDrawer } from '@/features/map/ui/facility-drawer';
import { MapNavigationBar } from '@/features/map/ui/map-navigation-bar';
import { MapRouteLayer } from '@/features/map/ui/map-route-layer';
import { createFacilityMarkerIcon } from '@/features/map/utils/facility-markers';
import { useGeolocation } from '@/hooks/use-geolocation';

const DEFAULT_ZOOM = 13;

const OSM_TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick });
  return null;
}

function MapRecenter({
  position,
  enabled,
}: {
  position: [number, number];
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    map.flyTo(position, DEFAULT_ZOOM, { duration: 0.8 });
  }, [enabled, map, position]);

  return null;
}

function MapInvalidateSize({ refreshKey }: { refreshKey?: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [map, refreshKey]);

  return null;
}

export function LeafletMap({ refreshKey }: { refreshKey?: boolean } = {}) {
  const geo = useGeolocation();
  const userMarkerIcon = useMemo(() => createUserMarkerIcon(), []);
  const userPosition = geo.status === 'success' ? geo.position : null;
  const filteredFacilities = useFilteredMapFacilities(userPosition);
  const activeRoute = useMapNavigationStore((state) => state.route);
  const navigationStatus = useMapNavigationStore((state) => state.status);
  const shouldRecenterOnUser =
    navigationStatus === 'idle' || navigationStatus === 'error';
  const openDrawer = useMapFacilityDrawerStore((state) => state.open);
  const closeDrawer = useMapFacilityDrawerStore((state) => state.setOpen);
  const facilityMarkerIcons = useMemo(
    () =>
      new Map(
        filteredFacilities.map((facility) => [
          facility.id,
          createFacilityMarkerIcon(facility.superCategory),
        ])
      ),
    [filteredFacilities]
  );

  return (
    <div className="leaflet-map relative h-full w-full">
      {geo.status === 'error' ? (
        <div className="absolute inset-x-4 top-[7.5rem] z-[1000] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          {geo.message} Showing Greater Victoria area.
        </div>
      ) : null}

      {userPosition && filteredFacilities.length === 0 ? (
        <div className="absolute inset-x-4 top-[7.5rem] z-[1000] rounded-xl border border-border bg-surface/95 px-4 py-3 text-sm text-accent-foreground shadow-sm">
          No matching care nearby. Try Urgent &amp; walk-in or widen distance in
          filters.
        </div>
      ) : null}

      <MapContainer
        center={geo.fallbackCenter}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="h-full w-full [&_.leaflet-control-zoom_a]:min-h-11 [&_.leaflet-control-zoom_a]:min-w-11"
        scrollWheelZoom
      >
        <TileLayer
          attribution={OSM_TILE_LAYER.attribution}
          url={OSM_TILE_LAYER.url}
          maxZoom={19}
        />
        <MapInvalidateSize refreshKey={refreshKey} />
        <MapClickHandler onMapClick={() => closeDrawer(false)} />
        {userPosition ? (
          <MapRecenter position={userPosition} enabled={shouldRecenterOnUser} />
        ) : null}
        {userPosition ? (
          <Marker position={userPosition} icon={userMarkerIcon}>
            <Popup>You are here</Popup>
          </Marker>
        ) : null}
        {activeRoute ? <MapRouteLayer route={activeRoute} /> : null}
        {userPosition
          ? filteredFacilities.map((facility) => (
              <Marker
                key={facility.id}
                position={facility.position}
                icon={facilityMarkerIcons.get(facility.id)}
                eventHandlers={{
                  click: () => openDrawer(facility, userPosition),
                }}
              />
            ))
          : null}
      </MapContainer>

      <MapNavigationBar />
      <FacilityDrawer />
    </div>
  );
}
