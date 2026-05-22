import type { Locale } from '@/lib/env';
import { DEFAULT_LOCALE } from '@/lib/env';

export function dashboardPath(locale: Locale = DEFAULT_LOCALE): string {
  return `/${locale}/dashboard`;
}
