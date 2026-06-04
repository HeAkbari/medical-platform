import L from 'leaflet';
import { MARKER_COLORS } from '../constants';
import type { FacilitySuperCategory } from '../types';

const MARKER_ICONS: Record<FacilitySuperCategory, string> = {
  'urgent-walk-in': '+',
  pharmacy: 'Rx',
  'primary-care': 'GP',
  'therapy-rehab': 'PT',
  'mental-health': 'MH',
  'dental-other': 'D',
};

export function createFacilityMarkerIcon(superCategory: FacilitySuperCategory) {
  const color = MARKER_COLORS[superCategory];
  const label = MARKER_ICONS[superCategory];

  return L.divIcon({
    className: 'facility-map-marker',
    html: `
      <div class="facility-map-marker__pin" style="--marker-color: ${color}">
        <span class="facility-map-marker__label">${label}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}
