'use client';

import { Drawer } from 'vaul';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { AppointmentBookingForm } from '@/features/appointments/ui/appointment-booking-form';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';
import { DoctorRating } from '@/features/map/ui/doctor-rating';

export function MapAppointmentDrawer() {
  const appointmentOpen = useMapAppointmentStore(
    (state) => state.appointmentOpen
  );
  const setAppointmentOpen = useMapAppointmentStore(
    (state) => state.setAppointmentOpen
  );
  const selectedDoctor = useMapAppointmentStore((state) => state.selectedDoctor);

  const doctorLabel = selectedDoctor
    ? `${selectedDoctor.firstName} ${selectedDoctor.lastName} · ${selectedDoctor.specialty}`
    : '';

  return (
    <ResponsiveDrawer open={appointmentOpen} onOpenChange={setAppointmentOpen}>
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
              <Drawer.Title className="mb-4 font-medium text-gray-900">
                Book appointment
              </Drawer.Title>

              {selectedDoctor ? (
                <>
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={selectedDoctor.profileImageUrl}
                      alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </p>
                      <p className="text-sm text-brand">
                        {selectedDoctor.specialty}
                      </p>
                      <DoctorRating
                        rating={selectedDoctor.rating}
                        reviewCount={selectedDoctor.reviewCount}
                      />
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto pb-2">
                    <AppointmentBookingForm
                      doctorId={selectedDoctor.id}
                      doctorLabel={doctorLabel}
                      onCancel={() => setAppointmentOpen(false)}
                    />
                  </div>
                </>
              ) : null}
      </div>
    </ResponsiveDrawer>
  );
}
