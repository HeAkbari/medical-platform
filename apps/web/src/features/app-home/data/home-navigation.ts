export type HomeServiceSlug =
  | 'appointments'
  | 'test-results'
  | 'advices'
  | 'documents';

export type HomeSupportSlug =
  | 'symptom-checker'
  | 'health-a-z'
  | 'local-services';

export interface HomeServiceItem {
  slug: HomeServiceSlug;
  title: string;
  description: string;
}

export interface HomeSupportItem {
  slug: HomeSupportSlug;
  title: string;
  description: string;
  href: string;
}

export const HOME_SERVICE_ITEMS: HomeServiceItem[] = [
  {
    slug: 'appointments',
    title: 'Appointments',
    description: 'Book, reschedule, or view upcoming and past visits.',
  },
  {
    slug: 'test-results',
    title: 'Test results',
    description: 'Laboratory and diagnostic results from your care team.',
  },
  {
    slug: 'advices',
    title: 'Advices',
    description: 'Educational guides and advice from your providers.',
  },
  {
    slug: 'documents',
    title: 'Documents',
    description: 'Letters, clinical notes, and records from your providers.',
  },
];

export const HOME_MAP_CTA = {
  title: 'Find care near you?',
  description:
    'Walk-in clinics, doctor offices, pharmacies, and emergency centres on the map.',
  href: '/home/map',
} as const;

export const HOME_SUPPORT_ITEMS: HomeSupportItem[] = [
  {
    slug: 'symptom-checker',
    title: 'Symptom checker',
    description: 'Get guidance based on your symptoms.',
    href: '/home/services/symptom-checker',
  },
  {
    slug: 'health-a-z',
    title: 'Health A–Z',
    description: 'Information about conditions, symptoms, and treatments.',
    href: '/home/services/health-a-z',
  },
];

export function getHomeService(slug: string): HomeServiceItem | undefined {
  return HOME_SERVICE_ITEMS.find((item) => item.slug === slug);
}

export function getHomeSupportPlaceholder(slug: string): HomeSupportItem | undefined {
  return HOME_SUPPORT_ITEMS.find((item) => item.slug === slug);
}

export function isUserServiceSlug(slug: string): slug is HomeServiceSlug {
  return HOME_SERVICE_ITEMS.some((item) => item.slug === slug);
}
