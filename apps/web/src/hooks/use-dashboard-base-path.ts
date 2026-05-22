'use client';

import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/env';
import { dashboardPath } from '@/lib/routes';

export function useDashboardBasePath(): string {
  const params = useParams<{ locale?: string }>();
  const locale = (params.locale ?? 'en') as Locale;
  return dashboardPath(locale);
}
