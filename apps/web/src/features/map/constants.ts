export const DOCTOR_SPECIALTIES = [
  'General',
  'Cardiology',
  'Dentistry',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
] as const;

export const MAP_NEED_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'General', label: 'General' },
  { id: 'Cardiology', label: 'Cardiology' },
  { id: 'Dentistry', label: 'Dentistry' },
  { id: 'Dermatology', label: 'Dermatology' },
  { id: 'Pediatrics', label: 'Pediatrics' },
  { id: 'Orthopedics', label: 'Orthopedics' },
] as const;

export type MapNeedOptionId = (typeof MAP_NEED_OPTIONS)[number]['id'];

export const DEFAULT_MAX_DISTANCE_KM = 50;
