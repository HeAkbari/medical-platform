'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { cn } from '@/components/ui/cn';
import {
  countUnreadMessages,
  MOCK_HEALTH_MESSAGES,
} from '@/features/messages/data/mock-messages';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { HomeScrollProvider } from '@/lib/routing/home-scroll-context';
import { HomeScrollRestoration } from '@/lib/routing/home-scroll-restoration';
import { captureHomeScroll } from '@/lib/routing/home-scroll-state';
import { normalizeAppPath } from '@/lib/routing/normalize-app-path';

function TabIcon({ name }: { name: 'home' | 'messages' | 'profile' }) {
  if (name === 'home') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'messages') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <path d="M4 6h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H8l-4 3v-3H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

export function AppTabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = normalizeAppPath(pathname);
  const unreadCount = countUnreadMessages(MOCK_HEALTH_MESSAGES);
  const { requireAuth, isLoading } = useRequireAuth();
  const mainScrollRef = useRef<HTMLElement>(null);

  const captureScroll = useCallback(() => {
    if (normalizeAppPath(pathname) === '/home') {
      captureHomeScroll(mainScrollRef.current);
    }
  }, [pathname]);

  const tabs = [
    {
      href: '/home',
      label: 'Home',
      icon: 'home' as const,
      requiresAuth: false,
      match: (path: string) =>
        path === '/home' ||
        (path.startsWith('/home/') &&
          path !== '/home/map' &&
          !path.startsWith('/home/map/')),
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: 'messages' as const,
      requiresAuth: true,
      match: (path: string) => path.startsWith('/messages'),
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: 'profile' as const,
      requiresAuth: true,
      match: (path: string) => path.startsWith('/profile'),
    },
  ];

  function handleProtectedTabClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (isLoading) {
      event.preventDefault();
      return;
    }

    const authorized = requireAuth({ type: 'navigate', href });
    if (!authorized) {
      event.preventDefault();
    }
  }

  return (
    <HomeScrollProvider captureScroll={captureScroll}>
      <div className="h-dvh overflow-hidden bg-brand-muted">
        <HomeScrollRestoration scrollContainerRef={mainScrollRef} />
        <main
          ref={mainScrollRef}
          className="mx-auto h-full max-w-lg overflow-y-auto overscroll-y-contain bg-brand-muted px-4 pb-24 pt-4 sm:px-5"
        >
          {children}
        </main>

        <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-subtle/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
        aria-label="Main navigation"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-3">
          {tabs.map((tab) => {
            const active = tab.match(normalizedPath);
            const showBadge = tab.href === '/messages' && unreadCount > 0;

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  scroll={tab.href === '/home' ? false : undefined}
                  onClick={
                    tab.requiresAuth
                      ? (event) => handleProtectedTabClick(event, tab.href)
                      : undefined
                  }
                  className={cn(
                    'relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-medium transition active:opacity-70',
                    active ? 'text-brand' : 'text-slate-500'
                  )}
                >
                  {active ? (
                    <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand-light" />
                  ) : null}
                  <span className="relative">
                    <TabIcon name={tab.icon} />
                    {showBadge ? (
                      <span className="absolute -end-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                        {unreadCount}
                      </span>
                    ) : null}
                  </span>
                  <span>{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      </div>
    </HomeScrollProvider>
  );
}
