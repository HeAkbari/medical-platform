export const APP_NAME = 'Medical Platform';
export const DEFAULT_LOCALE = 'en';
export const LOCALES = ['en', 'fa'] as const;
export type Locale = (typeof LOCALES)[number];

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? '/api',
} as const;
