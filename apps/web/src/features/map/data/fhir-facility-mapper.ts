import type { FhirLocation } from '@medical-platform/domain';
import type {
  CoverageBadge,
  FacilityCategory,
  FacilitySuperCategory,
  MapActionType,
  MapFacility,
  WeeklyHours,
} from '../types';
import { FACILITY_CATEGORIES } from '../types';

/**
 * Maps a FHIR R4 `Location` to the app's `MapFacility`.
 *
 * FHIR-native fields (name, position, address, telecom, hoursOfOperation, type)
 * come straight from the resource. App-specific concepts that FHIR core does not
 * model (superCategory, coverage badges, "why on map") are derived here from the
 * category. In phase 2 these may instead come from OSCAR extensions.
 */

const CATEGORY_SYSTEM = 'https://medical-platform.local/facility-category';

export const CATEGORY_TO_SUPER: Record<FacilityCategory, FacilitySuperCategory> = {
  'walk-in-clinic': 'urgent-walk-in',
  'urgent-care': 'urgent-walk-in',
  'emergency-department': 'urgent-walk-in',
  pharmacy: 'pharmacy',
  'family-practice': 'primary-care',
  'nurse-practitioner-clinic': 'primary-care',
  physiotherapy: 'therapy-rehab',
  chiropractic: 'therapy-rehab',
  'massage-therapy': 'therapy-rehab',
  psychology: 'mental-health',
  counselling: 'mental-health',
  dentistry: 'dental-other',
  podiatry: 'dental-other',
  dietitian: 'dental-other',
};

const SUPER_WHY_ON_MAP: Record<FacilitySuperCategory, string> = {
  'urgent-walk-in': 'Walk-in care — no referral needed',
  pharmacy: 'Pharmacy services nearby',
  'primary-care': 'Primary care provider',
  'therapy-rehab': 'Therapy & rehabilitation',
  'mental-health': 'Mental health support',
  'dental-other': 'Dental & other services',
};

const DAY_KEYS: (keyof WeeklyHours)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const FHIR_DAY_TO_KEY: Record<string, keyof WeeklyHours> = {
  sun: 'sunday',
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
};

function isFacilityCategory(value: string): value is FacilityCategory {
  return (FACILITY_CATEGORIES as readonly string[]).includes(value);
}

export function resolveCategory(location: FhirLocation): FacilityCategory {
  const coding = location.type
    ?.flatMap((concept) => concept.coding ?? [])
    .find((c) => c.system === CATEGORY_SYSTEM && c.code);

  if (coding?.code && isFacilityCategory(coding.code)) {
    return coding.code;
  }

  return 'walk-in-clinic';
}

/** "08:00:00" -> "8:00 AM" */
function formatTime(time?: string): string {
  if (!time) {
    return '';
  }

  const [hStr, mStr] = time.split(':');
  const hour = Number(hStr);
  const minute = mStr ?? '00';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}

export function buildWeeklyHours(
  hours: FhirLocation['hoursOfOperation']
): WeeklyHours | '24/7' {
  if (hours?.some((h) => h.allDay)) {
    return '24/7';
  }

  const closed = 'Closed';
  const week = {
    monday: closed,
    tuesday: closed,
    wednesday: closed,
    thursday: closed,
    friday: closed,
    saturday: closed,
    sunday: closed,
  } as WeeklyHours;

  for (const entry of hours ?? []) {
    const label = `${formatTime(entry.openingTime)} – ${formatTime(entry.closingTime)}`;
    for (const day of entry.daysOfWeek ?? []) {
      const key = FHIR_DAY_TO_KEY[day];
      if (key) {
        week[key] = label;
      }
    }
  }

  return week;
}

export function computeIsOpenNow(
  hours: WeeklyHours | '24/7',
  now = new Date()
): boolean {
  if (hours === '24/7') {
    return true;
  }

  const todayKey = DAY_KEYS[now.getDay()];
  const todayHours = todayKey ? hours[todayKey] : undefined;
  if (!todayHours || todayHours === 'Closed') {
    return false;
  }

  const [open, close] = todayHours.split('–').map((part) => parseLabelTime(part));
  if (open === null || close === null) {
    return false;
  }

  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= open && minutes <= close;
}

/** "8:00 AM" -> minutes since midnight */
function parseLabelTime(label: string): number | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') {
    hour += 12;
  }
  return hour * 60 + Number(match[2]);
}

function contactValue(
  telecom: FhirLocation['telecom'],
  system: 'phone' | 'url'
): string | undefined {
  return telecom?.find((entry) => entry.system === system)?.value;
}

export function fhirLocationToFacility(location: FhirLocation): MapFacility {
  const category = resolveCategory(location);
  const superCategory = CATEGORY_TO_SUPER[category];
  const subcategory =
    location.type?.find((concept) => concept.text)?.text ?? undefined;

  const hours = buildWeeklyHours(location.hoursOfOperation);
  const isOpenNow = computeIsOpenNow(hours);
  const phone = contactValue(location.telecom, 'phone');
  const website = contactValue(location.telecom, 'url');

  const coverageBadges: CoverageBadge[] = [];
  if (isOpenNow) {
    coverageBadges.push('open-now');
  }
  if (hours === '24/7') {
    coverageBadges.push('24-hours');
  }

  const actions: MapActionType[] = ['navigate'];
  if (phone) {
    actions.push('call');
  }

  return {
    id: location.id ?? '',
    category,
    superCategory,
    subcategory,
    name: location.name ?? 'Unnamed facility',
    address: {
      street: location.address?.line?.[0] ?? '',
      city: location.address?.city ?? '',
      province: 'BC',
      postalCode: location.address?.postalCode ?? '',
    },
    position: [location.position?.latitude ?? 0, location.position?.longitude ?? 0],
    phone,
    website,
    hours,
    isOpenNow,
    coverageBadges,
    whyOnMap: SUPER_WHY_ON_MAP[superCategory],
    province: 'BC',
    actions,
    supportsBooking: false,
    is24Hours: hours === '24/7',
    source: 'fhir',
    lastVerifiedAt: location.meta?.lastUpdated ?? new Date().toISOString(),
  };
}
