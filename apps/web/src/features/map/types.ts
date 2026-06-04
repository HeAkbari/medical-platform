export const FACILITY_SUPER_CATEGORIES = [
  'urgent-walk-in',
  'pharmacy',
  'primary-care',
  'therapy-rehab',
  'mental-health',
  'dental-other',
] as const;

export type FacilitySuperCategory = (typeof FACILITY_SUPER_CATEGORIES)[number];

export const FACILITY_CATEGORIES = [
  'walk-in-clinic',
  'urgent-care',
  'emergency-department',
  'pharmacy',
  'family-practice',
  'nurse-practitioner-clinic',
  'physiotherapy',
  'chiropractic',
  'massage-therapy',
  'psychology',
  'counselling',
  'dentistry',
  'podiatry',
  'dietitian',
] as const;

export type FacilityCategory = (typeof FACILITY_CATEGORIES)[number];

export type CoverageBadge =
  | 'provincially-insured'
  | 'co-pay-limit'
  | 'direct-pay'
  | 'private-insurance'
  | 'accepting-new-patients'
  | 'open-now'
  | '24-hours'
  | 'wait-time-estimate'
  | 'referral-not-required'
  | 'province-specific';

export type MapActionType = 'call' | 'navigate' | 'book';

export interface MapFacilityAddress {
  street: string;
  city: string;
  province: 'BC';
  postalCode: string;
}

export interface WeeklyHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface MapFacility {
  id: string;
  category: FacilityCategory;
  superCategory: FacilitySuperCategory;
  subcategory?: string;
  name: string;
  address: MapFacilityAddress;
  position: [number, number];
  phone?: string;
  website?: string;
  hours: WeeklyHours | '24/7';
  isOpenNow: boolean;
  coverageBadges: CoverageBadge[];
  acceptingNewPatients?: boolean;
  waitTimeMinutes?: number;
  waitTimeUpdatedAt?: string;
  waitTimeSource?: string;
  services?: string[];
  whyOnMap: string;
  province: 'BC';
  actions: MapActionType[];
  providerId?: string;
  supportsBooking: boolean;
  is24Hours?: boolean;
  minorAilmentsPrescribing?: boolean;
  source: 'mock';
  lastVerifiedAt: string;
}

export interface MapFacilityFilters {
  selectedSuperCategories: FacilitySuperCategory[];
  maxDistanceKm: number;
  openNowOnly: boolean;
  is24HoursOnly: boolean;
  acceptingNewPatientsOnly: boolean;
}

export interface MapRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export type MapNavigationStatus = 'idle' | 'loading' | 'success' | 'error';
