'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { normalizeAppPath } from '@/lib/routing/normalize-app-path';
import {
  restoreHomeScrollWithRetries,
  saveHomeScrollTop,
} from '@/lib/routing/home-scroll-state';

const HOME_HUB_PATH = '/home';

interface HomeScrollRestorationProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export function HomeScrollRestoration({
  scrollContainerRef,
}: HomeScrollRestorationProps) {
  const pathname = usePathname();
  const normalizedPath = normalizeAppPath(pathname);
  const isHomeHub = normalizedPath === HOME_HUB_PATH;
  const previousPathRef = useRef(normalizedPath);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const previousPath = previousPathRef.current;
    const leavingHome = previousPath === HOME_HUB_PATH && !isHomeHub;
    const enteringHome = isHomeHub && previousPath !== HOME_HUB_PATH;

    if (leavingHome) {
      if (container.scrollTop > 0) {
        saveHomeScrollTop(container.scrollTop);
      }

      container.scrollTop = 0;
    } else if (enteringHome) {
      const cleanup = restoreHomeScrollWithRetries(container);
      previousPathRef.current = normalizedPath;
      return cleanup;
    } else if (!isHomeHub) {
      container.scrollTop = 0;
    }

    previousPathRef.current = normalizedPath;
  }, [isHomeHub, normalizedPath, pathname, scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || !isHomeHub) {
      return;
    }

    const scrollContainer = container;

    function handleScroll() {
      saveHomeScrollTop(scrollContainer.scrollTop);
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isHomeHub, scrollContainerRef]);

  return null;
}
