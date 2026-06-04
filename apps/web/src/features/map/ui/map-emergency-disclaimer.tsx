'use client';

import { MAP_EMERGENCY_DISCLAIMER } from '../constants';
import { useMapNavigationStore } from '../store/map-navigation-store';

export function MapEmergencyDisclaimer() {
  const navigationStatus = useMapNavigationStore((state) => state.status);

  if (navigationStatus !== 'idle') {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[999] bg-gradient-to-t from-white via-white/95 to-transparent px-4 pt-6"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <p className="pointer-events-auto rounded-xl border border-amber-200/80 bg-amber-50/95 px-3 py-2 text-center text-xs leading-relaxed text-amber-950 backdrop-blur-sm">
        {MAP_EMERGENCY_DISCLAIMER}
      </p>
    </div>
  );
}
