'use client';

import Image from 'next/image';
import { useState } from 'react';
import { NavDrawer } from '@/components/layout/nav-drawer';
import { useAuth } from '@/lib/auth';

export function AppTopBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4 sm:px-5">
          {/* Hamburger / X — inline-start */}
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-accent-foreground transition hover:bg-accent active:opacity-70"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Centered greeting */}
          <div className="flex flex-1 items-center justify-center px-2">
            {isAuthenticated && user ? (
              <span className="truncate text-sm font-medium text-foreground">
                Hi {user.firstName}!
              </span>
            ) : null}
          </div>

          {/* DrFinder logo — inline-end (top-right) */}
          <div className="flex shrink-0 items-center">
            <Image
              src="/Dr-finder-logo.png"
              alt="DrFinder"
              width={1024}
              height={1024}
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      <NavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
