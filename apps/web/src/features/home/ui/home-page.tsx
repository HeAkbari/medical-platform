'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapFilter } from '@/features/map-filter/map-filter';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-600">
      Loading map...
    </div>
  ),
});

export function HomePage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-0 h-dvh w-full">
      <Map />

      {/* Filter button - top-right of map */}
      <button
        type="button"
        onClick={() => setFilterOpen(true)}
        className="absolute right-4 top-4 z-[1000] flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-md active:scale-95"
        aria-label="Open filters"
      >
        {/* Filter/sliders icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-slate-700"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="10" r="2" />
          <circle cx="20" cy="14" r="2" />
        </svg>
      </button>

      {/* Bottom sheet filter */}
      <MapFilter filterOpen={filterOpen} setFilterOpen={setFilterOpen} />

      {/* <div
        className="absolute inset-x-0 bottom-9 z-[1000] flex justify-center px-4 sm:bottom-8"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-lg backdrop-blur-md active:scale-95"
        >
          Open clinic
        </Link>
      </div> */}
    </div>
  );
}
