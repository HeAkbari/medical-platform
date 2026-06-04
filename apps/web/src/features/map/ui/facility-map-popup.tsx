'use client';

import { Button } from '@/components/ui';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import {
  COVERAGE_BADGE_LABELS,
  MAP_COVERAGE_DISCLAIMER,
  MAP_DIRECT_PAY_DISCLAIMER,
  MAP_WAIT_TIME_DISCLAIMER,
} from '../constants';
import { useMapNavigationStore } from '../store/map-navigation-store';
import type { MapFacility } from '../types';
import {
  formatFacilityAddress,
  formatWaitTimeUpdatedAt,
  getFacilityCategoryLabel,
} from '../utils/filter-facilities';
import { formatDistanceKm, getDistanceKm } from '../utils/geo';

interface FacilityMapPopupProps {
  facility: MapFacility;
  userPosition: [number, number];
}

function FacilityBadge({ label, variant }: { label: string; variant: 'category' | 'coverage' | 'open' }) {
  const className =
    variant === 'category'
      ? 'bg-brand-muted text-brand-dark'
      : variant === 'open'
        ? 'bg-green-100 text-green-800'
        : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

export function FacilityMapPopup({
  facility,
  userPosition,
}: FacilityMapPopupProps) {
  const { requireAuth } = useRequireAuth();
  const openAppointment = useMapAppointmentStore((state) => state.openAppointment);
  const startNavigation = useMapNavigationStore((state) => state.startNavigation);
  const navigationStatus = useMapNavigationStore((state) => state.status);
  const activeFacilityId = useMapNavigationStore(
    (state) => state.activeFacility?.id ?? null
  );

  const distanceLabel = formatDistanceKm(
    getDistanceKm(userPosition, facility.position)
  );
  const isNavigating =
    activeFacilityId === facility.id && navigationStatus === 'loading';
  const isActiveRoute =
    activeFacilityId === facility.id && navigationStatus === 'success';
  const canBook =
    facility.supportsBooking &&
    facility.actions.includes('book') &&
    Boolean(facility.providerId);
  const canCall = facility.actions.includes('call') && Boolean(facility.phone);
  const isEr = facility.category === 'emergency-department';
  const showDirectPayDisclaimer = facility.coverageBadges.includes('direct-pay');
  const showCoverageDisclaimer =
    facility.coverageBadges.includes('provincially-insured') ||
    facility.coverageBadges.includes('co-pay-limit');

  function handleCall() {
    if (!facility.phone) {
      return;
    }

    window.location.href = `tel:${facility.phone.replace(/\s/g, '')}`;
  }

  return (
    <div className="min-w-[260px] max-w-[320px] space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <FacilityBadge
          label={getFacilityCategoryLabel(facility)}
          variant="category"
        />
        {facility.isOpenNow ? (
          <FacilityBadge label="Open now" variant="open" />
        ) : null}
        {facility.coverageBadges.slice(0, 2).map((badge) => (
          <FacilityBadge
            key={badge}
            label={COVERAGE_BADGE_LABELS[badge] ?? badge}
            variant="coverage"
          />
        ))}
      </div>

      <div>
        <p className="font-semibold text-slate-900">{facility.name}</p>
        <p className="mt-0.5 text-sm text-slate-600">
          {formatFacilityAddress(facility)} · {distanceLabel}
        </p>
      </div>

      {facility.waitTimeMinutes !== undefined ? (
        <p className="text-sm text-slate-700">
          Wait: ~{facility.waitTimeMinutes} min
          {facility.waitTimeUpdatedAt
            ? ` (updated ${formatWaitTimeUpdatedAt(facility.waitTimeUpdatedAt)})`
            : ''}
        </p>
      ) : null}

      <p className="text-sm text-brand-dark">{facility.whyOnMap}</p>

      {isEr ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
          {MAP_WAIT_TIME_DISCLAIMER} Call 911 for life-threatening emergencies.
        </p>
      ) : null}

      <div className={`grid gap-2 pt-1 ${canBook ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Button
          variant={isActiveRoute ? 'primary' : 'secondary'}
          fullWidth
          disabled={isNavigating}
          onClick={() => startNavigation(facility, userPosition)}
        >
          {isNavigating ? '…' : isActiveRoute ? 'Navigating' : 'Navigate'}
        </Button>
        {canCall ? (
          <Button variant="secondary" fullWidth onClick={handleCall}>
            Call
          </Button>
        ) : null}
        {canBook ? (
          <Button
            fullWidth
            onClick={() =>
              requireAuth({ type: 'appointment', facility }, () =>
                openAppointment(facility)
              )
            }
          >
            Book
          </Button>
        ) : null}
      </div>

      {showCoverageDisclaimer ? (
        <p className="text-xs text-slate-500">{MAP_COVERAGE_DISCLAIMER}</p>
      ) : null}
      {showDirectPayDisclaimer ? (
        <p className="text-xs text-slate-500">{MAP_DIRECT_PAY_DISCLAIMER}</p>
      ) : null}
    </div>
  );
}
