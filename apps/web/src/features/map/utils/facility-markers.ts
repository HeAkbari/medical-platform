import L from 'leaflet';
import type { FacilitySuperCategory } from '../types';
import styles from './facility-markers.module.css';

const MARKER_ICONS: Record<FacilitySuperCategory, string> = {
  'urgent-walk-in': '+',
  pharmacy: 'Rx',
  'primary-care': 'GP',
  'therapy-rehab': 'PT',
  'mental-health': 'MH',
  'dental-other': 'D',
};

const PIN_VARIANT_CLASS: Record<FacilitySuperCategory, string> = {
  'urgent-walk-in': styles.urgentWalkIn,
  pharmacy: styles.pharmacy,
  'primary-care': styles.primaryCare,
  'therapy-rehab': styles.therapyRehab,
  'mental-health': styles.mentalHealth,
  'dental-other': styles.dentalOther,
};

function buildMarkerHtml(superCategory: FacilitySuperCategory, label: string): string {
  return `
    <div class="${styles.pin} ${PIN_VARIANT_CLASS[superCategory]}">
      <span class="${styles.label}">${label}</span>
    </div>
  `;
}

export function createFacilityMarkerIcon(superCategory: FacilitySuperCategory) {
  const label = MARKER_ICONS[superCategory];

  return L.divIcon({
    className: styles.leafletFacilityIcon,
    html: buildMarkerHtml(superCategory, label),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}
