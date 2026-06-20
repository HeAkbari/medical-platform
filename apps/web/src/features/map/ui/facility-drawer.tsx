'use client';

import { Drawer } from 'vaul';
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
import {
  FACILITY_DRAWER_SNAP_POINTS,
  SNAP_FULL,
  useMapFacilityDrawerStore,
} from '../store/map-facility-drawer-store';
import { FacilityDetailSection } from './facility-detail-section';
import {
  formatFacilityAddress,
  formatWaitTimeUpdatedAt,
  getFacilityCategoryLabel,
} from '../utils/filter-facilities';
import { formatDistanceKm, getDistanceKm } from '../utils/geo';
import type { MapFacility } from '../types';

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: 'category' | 'coverage' | 'open';
}) {
  const cls =
    variant === 'category'
      ? 'bg-brand-muted text-brand-dark'
      : variant === 'open'
        ? 'bg-green-100 text-green-800'
        : 'bg-slate-100 text-slate-700';
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

interface DrawerContentProps {
  facility: MapFacility;
  userPosition: [number, number];
  isFullSnap: boolean;
  setActiveSnapPoint: (point: number | string | null) => void;
}

function DrawerContent({
  facility,
  userPosition,
  isFullSnap,
  setActiveSnapPoint,
}: DrawerContentProps) {
  const { requireAuth } = useRequireAuth();
  const openAppointment = useMapAppointmentStore((s) => s.openAppointment);
  const startNavigation = useMapNavigationStore((s) => s.startNavigation);
  const navigationStatus = useMapNavigationStore((s) => s.status);
  const activeFacilityId = useMapNavigationStore(
    (s) => s.activeFacility?.id ?? null,
  );

  const distanceLabel = formatDistanceKm(
    getDistanceKm(userPosition, facility.position),
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
  const showDirectPayDisclaimer =
    facility.coverageBadges.includes('direct-pay');
  const showCoverageDisclaimer =
    facility.coverageBadges.includes('provincially-insured') ||
    facility.coverageBadges.includes('co-pay-limit');

  function handleCall() {
    window.location.href = `tel:${facility.phone!.replace(/\s/g, '')}`;
  }

  const actionCols =
    canBook && canCall
      ? 'grid-cols-3'
      : canCall || canBook
        ? 'grid-cols-2'
        : 'grid-cols-1';

  return (
    <div
      className={`flex-1 px-4 pb-8 ${isFullSnap ? 'overflow-y-auto' : 'overflow-hidden'}`}
    >
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            label={getFacilityCategoryLabel(facility)}
            variant="category"
          />
          {facility.isOpenNow ? (
            <Badge label="Open now" variant="open" />
          ) : null}
          {facility.coverageBadges.slice(0, 2).map((badge) => (
            <Badge
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

        <p className="text-sm text-brand-dark">{facility.whyOnMap}</p>

        {facility.waitTimeMinutes !== undefined ? (
          <p className="text-sm text-slate-700">
            Wait: ~{facility.waitTimeMinutes} min
            {facility.waitTimeUpdatedAt
              ? ` (updated ${formatWaitTimeUpdatedAt(facility.waitTimeUpdatedAt)})`
              : ''}
          </p>
        ) : null}

        {isEr ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
            {MAP_WAIT_TIME_DISCLAIMER} Call 911 for life-threatening
            emergencies.
          </p>
        ) : null}

        <div className={`grid gap-2 pt-1 ${actionCols}`}>
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
                  openAppointment(facility),
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

        {!isFullSnap ? (
          <button
            onClick={() => setActiveSnapPoint(SNAP_FULL)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 py-2 text-xs text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-3.5 w-3.5"
            >
              <path
                d="M5 15l7-7 7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            View clinic details
          </button>
        ) : null}

        {isFullSnap ? <FacilityDetailSection facilityId={facility.id} /> : null}
      </div>
    </div>
  );
}

export function FacilityDrawer() {
  const {
    facility,
    isOpen,
    activeSnapPoint,
    userPosition,
    setOpen,
    setActiveSnapPoint,
  } = useMapFacilityDrawerStore();

  const isFullSnap = activeSnapPoint === SNAP_FULL;

  // Drawer.Root must always be mounted so Vaul can animate open→close transitions.
  // Content is rendered conditionally inside the portal.
  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={setOpen}
      snapPoints={[...FACILITY_DRAWER_SNAP_POINTS]}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-1500 flex h-[82vh] flex-col rounded-t-2xl bg-white shadow-[0_-4px_32px_rgba(0,0,0,0.14)] outline-none">
          <Drawer.Title className="sr-only">
            {facility?.name ?? 'Clinic details'}
          </Drawer.Title>

          {/* Visual drag handle */}
          <div className="mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full bg-slate-300" />

          {facility && userPosition ? (
            <DrawerContent
              facility={facility}
              userPosition={userPosition}
              isFullSnap={isFullSnap}
              setActiveSnapPoint={setActiveSnapPoint}
            />
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
