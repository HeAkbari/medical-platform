'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { DoctorReviewsDrawer } from '@/features/doctor-reviews/doctor-reviews-drawer';
import { MapAppointmentDrawer } from '@/features/map-appointment/map-appointment-drawer';
import { MapNeedSelector } from '@/features/map/ui/map-need-selector';
import { MapFilter } from '@/features/map-filter/map-filter';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
});

export function HomePage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-0 h-dvh w-full">
      <Map />

      <Link
        href="/home"
        className="absolute left-4 top-4 z-[1000] flex min-h-11 items-center gap-1 rounded-full border border-brand-subtle/80 bg-white/95 px-4 py-2 text-sm font-medium text-brand shadow-lg backdrop-blur-md active:scale-95"
      >
        ← Home
      </Link>

      <button
        type="button"
        onClick={() => setFilterOpen(true)}
        className="absolute right-4 top-4 z-[1000] flex min-h-11 min-w-11 items-center justify-center rounded-full border border-brand-subtle/80 bg-white/95 p-3 shadow-lg backdrop-blur-md active:scale-95"
        aria-label="Open filters"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-muted-foreground"
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

      <MapFilter filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
      <MapNeedSelector />
      <DoctorReviewsDrawer />
      <MapAppointmentDrawer />
    </div>
  );
}
