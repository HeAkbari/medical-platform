import type { Doctor } from '@medical-platform/domain';

export type HomeSearchChipId = 'urgent' | 'find-physician' | 'near-me';

export interface HomeSearchChip {
  id: HomeSearchChipId;
  label: string;
  href: string;
  description: string;
}

export const HOME_SEARCH_CHIPS: HomeSearchChip[] = [
  {
    id: 'urgent',
    label: 'Urgent appointment',
    href: '/home/services/appointments',
    description: 'Real-time openings and walk-in options.',
  },
  {
    id: 'find-physician',
    label: 'Find physician',
    href: '/home/find-physician',
    description: 'Browse physicians by region and sponsored placement.',
  },
  {
    id: 'near-me',
    label: 'Near me',
    href: '/home/map',
    description: 'Open the map using your device location.',
  },
];

export const COMPLIANCE_LINKS = [
  {
    label: 'Terms of use',
    href: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage',
  },
  {
    label: 'PIPA privacy policy',
    href: 'https://www2.gov.bc.ca/gov/content/governments/services-for-public/sectors-bc/physician-resources/privacy',
  },
  {
    label: 'BC health guidelines',
    href: 'https://www.healthlinkbc.ca/',
  },
] as const;

export function filterDoctorsByQuery(
  doctors: Doctor[],
  query: string,
  limit?: number
): Doctor[] {
  const normalized = query.trim().toLowerCase();

  const filtered = normalized
    ? doctors.filter((doctor) => {
        const haystack = [
          doctor.firstName,
          doctor.lastName,
          doctor.specialty,
          doctor.email,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalized);
      })
    : doctors;

  return limit ? filtered.slice(0, limit) : filtered;
}
