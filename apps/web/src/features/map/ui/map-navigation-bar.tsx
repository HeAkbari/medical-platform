'use client';

import { Button } from '@/components/ui';
import { useMapNavigationStore } from '../store/map-navigation-store';
import {
  formatDistanceMeters,
  formatDuration,
} from '../utils/format-route';

export function MapNavigationBar() {
  const activeDoctor = useMapNavigationStore((state) => state.activeDoctor);
  const route = useMapNavigationStore((state) => state.route);
  const status = useMapNavigationStore((state) => state.status);
  const errorMessage = useMapNavigationStore((state) => state.errorMessage);
  const clearNavigation = useMapNavigationStore((state) => state.clearNavigation);

  if (status === 'idle' || !activeDoctor) {
    return null;
  }

  return (
    <div
      className="absolute inset-x-4 bottom-4 z-[1000] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Navigation
          </p>
          <p className="truncate font-semibold text-slate-900">
            {activeDoctor.firstName} {activeDoctor.lastName}
          </p>

          {status === 'loading' ? (
            <p className="mt-1 text-sm text-slate-600">Calculating route...</p>
          ) : null}

          {status === 'error' ? (
            <p className="mt-1 text-sm text-red-600">
              {errorMessage ?? 'Unable to calculate route'}
            </p>
          ) : null}

          {status === 'success' && route ? (
            <p className="mt-1 text-sm text-slate-600">
              {formatDistanceMeters(route.distanceMeters)} ·{' '}
              {formatDuration(route.durationSeconds)}
            </p>
          ) : null}
        </div>

        <Button variant="secondary" onClick={clearNavigation}>
          End route
        </Button>
      </div>
    </div>
  );
}
