'use client';

import { useRouter } from 'next/navigation';

/**
 * Navigates back through actual browser history instead of pushing a new
 * entry, so repeated back/forward taps don't accumulate duplicate history
 * entries and loop between two pages. Falls back to `fallbackHref` when
 * there's no history to go back to (e.g. a deep link opened in a new tab).
 */
export function useBackNavigation(fallbackHref: string) {
  const router = useRouter();

  return function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };
}
