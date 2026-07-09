export type ProfileSectionSlug =
  | 'personal-details'
  | 'proxy-access'
  | 'health-choices';

export interface ProfileSectionItem {
  slug: ProfileSectionSlug;
  title: string;
  description: string;
}

export const PROFILE_SECTIONS: ProfileSectionItem[] = [
  {
    slug: 'personal-details',
    title: 'Personal details',
    description: 'Healthcare Number, address, phone, and care plans.',
  },
  {
    slug: 'proxy-access',
    title: 'Manage health services for others',
    description: 'Proxy access for children or people you care for.',
  },
  {
    slug: 'health-choices',
    title: 'Health choices',
    description: 'Organ donation and use of health data for research.',
  },
];

export function getProfileSection(
  slug: string
): ProfileSectionItem | undefined {
  return PROFILE_SECTIONS.find((item) => item.slug === slug);
}
