'use client';

import { Drawer } from 'vaul';
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
    <Drawer.Root open={appointmentOpen} onOpenChange={setAppointmentOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-fit max-h-[88vh] flex-col rounded-t-[10px] bg-gray-100 outline-none">
          <div className="flex max-h-[88vh] flex-col rounded-t-[10px] bg-white p-4">
            <div className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />

            <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col">
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
                      <p className="text-sm text-teal-700">
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
