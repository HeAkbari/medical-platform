export type HomeServiceSlug =
  | 'prescriptions'
  | 'appointments'
  | 'test-results'
  | 'vaccinations'
  | 'health-conditions'
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
    slug: 'prescriptions',
    title: 'Prescriptions',
    description: 'Order repeat prescriptions and choose a pharmacy.',
  },
  {
    slug: 'appointments',
    title: 'Appointments',
    description: 'Book, view, or cancel GP appointments and online advice.',
  },
  {
    slug: 'test-results',
    title: 'Test results',
    description: 'View results from your GP or hospital tests.',
  },
  {
    slug: 'vaccinations',
    title: 'Vaccinations',
    description: 'See vaccination history and book new vaccines.',
  },
  {
    slug: 'health-conditions',
    title: 'Health conditions',
    description: 'Conditions, allergies, and medicine reactions on record.',
  },
  {
    slug: 'documents',
    title: 'Documents',
    description: 'Letters and documents from your GP or hospital.',
  },
];

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
  {
    slug: 'local-services',
    title: 'Find local health services',
    description: 'Pharmacies, GPs, and nearby care on the map.',
    href: '/home/map',
  },
];

export function getHomeService(slug: string): HomeServiceItem | undefined {
  return HOME_SERVICE_ITEMS.find((item) => item.slug === slug);
}

export function getHomeSupportPlaceholder(slug: string): HomeSupportItem | undefined {
  if (slug === 'symptom-checker' || slug === 'health-a-z') {
    return HOME_SUPPORT_ITEMS.find((item) => item.slug === slug);
  }

  return undefined;
}

export function isUserServiceSlug(slug: string): slug is HomeServiceSlug {
  return HOME_SERVICE_ITEMS.some((item) => item.slug === slug);
}
