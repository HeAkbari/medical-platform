import type { FacilitySuperCategory } from './types';

export const DEFAULT_MAX_DISTANCE_KM = 50;

export const MAP_CATEGORY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'urgent-walk-in', label: 'Urgent & walk-in' },
  { id: 'pharmacy', label: 'Pharmacy' },
  { id: 'primary-care', label: 'Primary care' },
  { id: 'therapy-rehab', label: 'Therapy & rehab' },
  { id: 'mental-health', label: 'Mental health' },
  { id: 'dental-other', label: 'Dental & other' },
] as const;

export type MapCategoryOptionId = (typeof MAP_CATEGORY_OPTIONS)[number]['id'];

export const COVERAGE_BADGE_LABELS: Record<string, string> = {
  'provincially-insured': 'Provincially insured visit',
  'co-pay-limit': 'May require co-pay / annual limit',
  'direct-pay': 'Direct pay',
  'private-insurance': 'Private insurance accepted',
  'accepting-new-patients': 'Accepting new patients',
  'open-now': 'Open now',
  '24-hours': '24 hours',
  'wait-time-estimate': 'Wait time (estimate)',
  'referral-not-required': 'Referral not required',
  'province-specific': 'Province-specific',
};

export const CATEGORY_LABELS: Record<FacilitySuperCategory, string> = {
  'urgent-walk-in': 'Urgent & walk-in',
  pharmacy: 'Pharmacy',
  'primary-care': 'Primary care',
  'therapy-rehab': 'Therapy & rehab',
  'mental-health': 'Mental health',
  'dental-other': 'Dental & other',
};

export const MARKER_COLORS: Record<FacilitySuperCategory, string> = {
  'urgent-walk-in': '#dc2626',
  pharmacy: '#16a34a',
  'primary-care': '#2563eb',
  'therapy-rehab': '#7c3aed',
  'mental-health': '#0d9488',
  'dental-other': '#d97706',
};

export const MAP_EMERGENCY_DISCLAIMER =
  'For life-threatening emergencies, call 911. This map shows care you can access directly without a specialist referral.';

export const MAP_WAIT_TIME_DISCLAIMER =
  'Wait times are estimates. Severe symptoms may need 911.';

export const MAP_COVERAGE_DISCLAIMER =
  'Provincial coverage varies. Bring your MSP card. Confirm fees before your visit.';

export const MAP_DIRECT_PAY_DISCLAIMER =
  'Typically not covered by provincial health insurance.';
