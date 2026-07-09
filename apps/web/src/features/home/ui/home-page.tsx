'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapAppointmentDrawer } from '@/features/map-appointment/map-appointment-drawer';
import { MapCategorySelector } from '@/features/map/ui/map-category-selector';
import { MapEmergencyDisclaimer } from '@/features/map/ui/map-emergency-disclaimer';
import { MapSearchBar } from '@/features/map/ui/map-search-bar';
import { MapFilter } from '@/features/map-filter/map-filter';
import { PhoneAuthDrawer } from '@/features/phone-auth/phone-auth-drawer';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
});

export function HomePage({
  onClose,
  showChrome = true,
}: { onClose?: () => void; showChrome?: boolean } = {}) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-0 h-dvh w-full">
      <Map refreshKey={showChrome} />

      {showChrome ? (
        <>
          {/* Map top controls: header row + search bar */}
          <div className="absolute inset-x-0 top-0 z-1000">
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-brand-subtle/80 bg-surface/95 px-4 py-2 text-sm font-medium text-brand shadow-lg backdrop-blur-md active:scale-95"
                >
                  ← Back
                </button>
              ) : (
                <Link
                  href="/home"
                  className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-brand-subtle/80 bg-surface/95 px-4 py-2 text-sm font-medium text-brand shadow-lg backdrop-blur-md active:scale-95"
                >
                  ← Home
                </Link>
              )}

              <h1 className="truncate text-center text-sm font-semibold text-foreground drop-shadow-sm">
                Find care near you
              </h1>

              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-brand-subtle/80 bg-surface/95 p-3 shadow-lg backdrop-blur-md active:scale-95"
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
            </div>

            {/* Search bar row (P5 v0.4) */}
            <MapSearchBar />
          </div>

          <MapCategorySelector />
          <MapEmergencyDisclaimer />
          <MapFilter filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
        </>
      ) : null}
      <MapAppointmentDrawer />
      <PhoneAuthDrawer />
    </div>
  );
}
