'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { AppTopBar } from '@/components/layout/app-top-bar';
import { cn } from '@/components/ui/cn';
import {
  selectUnreadNotificationCount,
  useNotificationsStore,
} from '@/features/notifications/store/notifications-store';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useAuth } from '@/lib/auth';
import { HomeScrollProvider } from '@/lib/routing/home-scroll-context';
import { HomeScrollRestoration } from '@/lib/routing/home-scroll-restoration';
import { captureHomeScroll } from '@/lib/routing/home-scroll-state';
import { normalizeAppPath } from '@/lib/routing/normalize-app-path';

function TabIcon({
  name,
}: {
  name: 'home' | 'appointments' | 'alerts' | 'profile';
}) {
  if (name === 'home') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'appointments') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'alerts') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'profile') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

export function AppTabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = normalizeAppPath(pathname);
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = selectUnreadNotificationCount(notifications);
  const { requireAuth, isLoading } = useRequireAuth();
  const { user, isAuthenticated } = useAuth();
  const mainScrollRef = useRef<HTMLElement>(null);
  const captureScroll = useCallback(() => {
    if (normalizeAppPath(pathname) === '/home') {
      captureHomeScroll(mainScrollRef.current);
    }
  }, [pathname]);

  const profileLabel =
    isAuthenticated && user?.firstName ? user.firstName : 'Profile';

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
      href: '/home/services/appointments',
      label: 'Appointments',
      icon: 'appointments' as const,
      requiresAuth: true,
      match: (path: string) => path.startsWith('/home/services/appointments'),
    },
    {
      href: '/notifications',
      label: 'Alerts',
      icon: 'alerts' as const,
      requiresAuth: true,
      match: (path: string) => path.startsWith('/notifications'),
    },
    {
      href: '/profile',
      label: profileLabel,
      icon: 'profile' as const,
      requiresAuth: false,
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
      <div className="h-dvh overflow-hidden bg-background">
        <AppTopBar />
        <HomeScrollRestoration scrollContainerRef={mainScrollRef} />
        <main
          ref={mainScrollRef}
          className="mx-auto h-full max-w-lg overflow-y-auto overscroll-y-contain bg-background px-4 pb-24 pt-18 sm:px-5"
        >
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
          aria-label="Main navigation"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-4">
            {tabs.map((tab) => {
              const active = tab.match(normalizedPath);
              const showBadge = tab.icon === 'alerts' && unreadCount > 0;

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
                      'relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition active:opacity-70 sm:px-2 sm:text-[11px]',
                      active ? 'text-brand' : 'text-faint-foreground'
                    )}
                  >
                    {active ? (
                      <span className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-brand-light sm:inset-x-3" />
                    ) : null}
                    <span className="relative">
                      <TabIcon name={tab.icon} />
                      {showBadge ? (
                        <span className="absolute -inset-e-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                          {unreadCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="max-w-full truncate">{tab.label}</span>
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
