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
import { useFilteredMapDoctors } from '@/features/map/hooks/use-filtered-map-doctors';
import { useMapNavigationStore } from '@/features/map/store/map-navigation-store';
import { DoctorMapPopup } from '@/features/map/ui/doctor-map-popup';
import { MapNavigationBar } from '@/features/map/ui/map-navigation-bar';
import { MapRouteLayer } from '@/features/map/ui/map-route-layer';
import { formatDoctorRatingLabel } from '@/features/map/ui/doctor-rating';
import { useGeolocation } from '@/hooks/use-geolocation';

const DEFAULT_ZOOM = 15;

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

function createDoctorMarkerIcon(
  profileImageUrl: string,
  rating: number,
  reviewCount: number
) {
  const ratingLabel = formatDoctorRatingLabel(rating, reviewCount);

  return L.divIcon({
    className: 'doctor-map-marker',
    html: `
      <div class="doctor-map-marker__wrapper">
        <img src="${profileImageUrl}" alt="" />
        <span class="doctor-map-marker__rating">${ratingLabel}</span>
      </div>
    `,
    iconSize: [48, 52],
    iconAnchor: [24, 26],
    popupAnchor: [0, -26],
  });
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

export function LeafletMap() {
  const geo = useGeolocation();
  const userMarkerIcon = useMemo(() => createUserMarkerIcon(), []);
  const userPosition = geo.status === 'success' ? geo.position : null;
  const filteredDoctors = useFilteredMapDoctors(userPosition);
  const activeRoute = useMapNavigationStore((state) => state.route);
  const navigationStatus = useMapNavigationStore((state) => state.status);
  const shouldRecenterOnUser =
    navigationStatus === 'idle' || navigationStatus === 'error';
  const doctorMarkerIcons = useMemo(
    () =>
      new Map(
        filteredDoctors.map((doctor) => [
          doctor.id,
          createDoctorMarkerIcon(
            doctor.profileImageUrl,
            doctor.rating,
            doctor.reviewCount
          ),
        ])
      ),
    [filteredDoctors]
  );

  return (
    <div className="relative h-full w-full">
      {geo.status === 'loading' ? (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-200/90 text-sm text-slate-600">
          Getting your location...
        </div>
      ) : null}

      {geo.status === 'error' ? (
        <div className="absolute inset-x-4 top-4 z-[1000] rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          {geo.message}
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
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
          ? filteredDoctors.map((doctor) => (
              <Marker
                key={doctor.id}
                position={doctor.position}
                icon={doctorMarkerIcons.get(doctor.id)}
              >
                <Popup>
                  <DoctorMapPopup
                    doctor={doctor}
                    userPosition={userPosition}
                  />
                </Popup>
              </Marker>
            ))
          : null}
      </MapContainer>

      <MapNavigationBar />
    </div>
  );
}
