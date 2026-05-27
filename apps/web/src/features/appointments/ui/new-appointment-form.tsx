'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  useDoctorsQuery,
} from '@/hooks';
import {
  Button,
  Card,
  CardHeader,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';
import { AppointmentBookingForm } from './appointment-booking-form';

export function NewAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorsQuery = useDoctorsQuery();

  const initialPatientId = searchParams.get('patientId') ?? '';
  const initialDoctorId = searchParams.get('doctorId') ?? '';
  const [doctorId, setDoctorId] = useState(initialDoctorId);

  if (doctorsQuery.isLoading) {
    return <LoadingState label="Loading form data..." />;
  }

  if (doctorsQuery.isError) {
    return <ErrorState message="Could not load doctors." />;
  }

  const doctors = doctorsQuery.data?.data ?? [];
  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader
          title="Book appointment"
          description="Creates a new appointment through the mock API."
          action={
            <Link href="/dashboard/appointments">
              <Button variant="secondary" fullWidth>
                Back
              </Button>
            </Link>
          }
        />

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
            onSuccess={() => router.push('/dashboard/appointments')}
          />
        ) : (
          <p className="text-sm text-slate-500">Select a doctor to continue.</p>
        )}
      </Card>
    </div>
  );
}
