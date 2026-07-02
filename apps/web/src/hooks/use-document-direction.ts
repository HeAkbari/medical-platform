'use client';

import { usePathname } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/env';

export type DocumentDirection = 'ltr' | 'rtl';

/** Matches `<html dir>` from the locale layout (`fa` → rtl, otherwise ltr). */
export function useDocumentDirection(): DocumentDirection {
  const pathname = usePathname();
  const locale = pathname.split('/').filter(Boolean)[0];

  if (LOCALES.includes(locale as Locale) && locale === 'fa') {
    return 'rtl';
  }

  return 'ltr';
}

/** Side the nav drawer should slide from — always the inline-start edge. */
export function useNavDrawerDirection(): 'left' | 'right' {
  return useDocumentDirection() === 'rtl' ? 'right' : 'left';
}
