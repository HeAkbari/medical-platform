'use client';

import { Drawer } from 'vaul';
import { useEffect, useState } from 'react';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { ErrorState, LoadingState } from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';
import { useDoctorsQuery } from '@/hooks';
import { useAppointmentBookingStore } from '@/features/appointments/store/appointment-booking-store';
import { AppointmentBookingForm } from './appointment-booking-form';

export function AppointmentBookingDrawer() {
  const bookingOpen = useAppointmentBookingStore((state) => state.bookingOpen);
  const setBookingOpen = useAppointmentBookingStore((state) => state.setBookingOpen);
  const initialDoctorId = useAppointmentBookingStore(
    (state) => state.initialDoctorId
  );
  const initialPatientId = useAppointmentBookingStore(
    (state) => state.initialPatientId
  );
  const doctorsQuery = useDoctorsQuery({ enabled: bookingOpen });

  const [doctorId, setDoctorId] = useState('');

  useEffect(() => {
    if (bookingOpen) {
      setDoctorId(initialDoctorId);
    }
  }, [bookingOpen, initialDoctorId]);

  const staffMode = Boolean(initialPatientId);
  const doctors = doctorsQuery.data?.data ?? [];
  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);

  return (
    <ResponsiveDrawer open={bookingOpen} onOpenChange={setBookingOpen}>
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-y-auto pb-4">
        <Drawer.Title className="mb-1 font-medium text-gray-900">
          Book appointment
        </Drawer.Title>
        <p className="mb-4 text-sm text-slate-600">
          Choose a doctor and schedule your visit.
        </p>

        {doctorsQuery.isLoading ? (
          <LoadingState label="Loading doctors..." />
        ) : null}

        {doctorsQuery.isError ? (
          <ErrorState message="Could not load doctors." />
        ) : null}

        {doctorsQuery.isSuccess ? (
          <>
            <label className="mb-4 grid gap-2">
              <span className="text-sm font-medium text-slate-700">Doctor</span>
              <select
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                className={inputClassName}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.firstName} {doctor.lastName} · {doctor.specialty}
                  </option>
                ))}
              </select>
            </label>

            {selectedDoctor ? (
              <AppointmentBookingForm
                doctorId={selectedDoctor.id}
                doctorLabel={`${selectedDoctor.firstName} ${selectedDoctor.lastName} · ${selectedDoctor.specialty}`}
                initialPatientId={initialPatientId}
                showDoctorSummary={false}
                staffMode={staffMode}
                onCancel={() => setBookingOpen(false)}
                onSuccess={() => setBookingOpen(false)}
              />
            ) : (
              <p className="text-sm text-slate-500">Select a doctor to continue.</p>
            )}
          </>
        ) : null}
      </div>
    </ResponsiveDrawer>
  );
}
