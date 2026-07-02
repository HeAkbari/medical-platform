'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NavDrawer } from '@/components/layout/nav-drawer';

export function AppTopBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-subtle/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4 sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 active:opacity-70"
            aria-label="Open menu"
          >
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
          </button>

          <Link
            href="/home"
            scroll={false}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center gap-2 active:opacity-70"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-bold text-brand-foreground"
              aria-hidden="true"
            >
              DF
            </span>
            <span className="truncate text-base font-semibold tracking-tight text-slate-900">
              DrFinder
            </span>
          </Link>
        </div>
      </header>

      <NavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
