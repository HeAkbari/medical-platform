import { LOCALES, type Locale } from '@/lib/env';

/** Strip locale prefix and map root paths to the patient home route. */
export function normalizeAppPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '/home';
  }

  const firstSegment = segments[0];

  if (LOCALES.includes(firstSegment as Locale)) {
    const path = `/${segments.slice(1).join('/')}`;
    return path === '/' || path === '' ? '/home' : path;
  }

  return pathname === '/' ? '/home' : pathname;
}
