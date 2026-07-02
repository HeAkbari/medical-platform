'use client';

import { Drawer } from 'vaul';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { AppointmentBookingForm } from '@/features/appointments/ui/appointment-booking-form';
import { COVERAGE_BADGE_LABELS } from '@/features/map/constants';
import {
  formatFacilityAddress,
  getFacilityCategoryLabel,
} from '@/features/map/utils/filter-facilities';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';

export function MapAppointmentDrawer() {
  const appointmentOpen = useMapAppointmentStore(
    (state) => state.appointmentOpen
  );
  const setAppointmentOpen = useMapAppointmentStore(
    (state) => state.setAppointmentOpen
  );
  const selectedFacility = useMapAppointmentStore(
    (state) => state.selectedFacility
  );

  const facilityLabel = selectedFacility
    ? `${selectedFacility.name} · ${getFacilityCategoryLabel(selectedFacility)}`
    : '';
  const providerId = selectedFacility?.providerId ?? '';

  return (
    <ResponsiveDrawer open={appointmentOpen} onOpenChange={setAppointmentOpen}>
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        <Drawer.Title className="mb-4 font-medium text-foreground">
          Book appointment
        </Drawer.Title>

        {selectedFacility ? (
          <>
            <div className="mb-4 rounded-xl border border-border bg-muted p-3">
              <p className="font-semibold text-foreground">
                {selectedFacility.name}
              </p>
              <p className="mt-0.5 text-sm text-brand">
                {getFacilityCategoryLabel(selectedFacility)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatFacilityAddress(selectedFacility)}
              </p>
              {selectedFacility.coverageBadges.length > 0 ? (
                <p className="mt-2 text-xs text-faint-foreground">
                  {selectedFacility.coverageBadges
                    .slice(0, 2)
                    .map((badge) => COVERAGE_BADGE_LABELS[badge] ?? badge)
                    .join(' · ')}
                </p>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pb-2">
              <AppointmentBookingForm
                doctorId={providerId}
                doctorLabel={facilityLabel}
                showDoctorSummary={false}
                onCancel={() => setAppointmentOpen(false)}
              />
            </div>
          </>
        ) : null}
      </div>
    </ResponsiveDrawer>
  );
}
