'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DASHBOARD_BASE_PATH } from '@/config';
import {
  useCreateAppointmentMutation,
  useDoctorsQuery,
  usePatientsQuery,
} from '@/shared/hooks';
import { createAppointmentSchema } from '@/shared/lib/validators/schemas';
import {
  Button,
  Card,
  CardHeader,
  ErrorState,
  LoadingState,
} from '@/shared/ui';

export function NewAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientsQuery = usePatientsQuery();
  const doctorsQuery = useDoctorsQuery();
  const createMutation = useCreateAppointmentMutation();

  const [patientId, setPatientId] = useState(
    searchParams.get('patientId') ?? ''
  );
  const [doctorId, setDoctorId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (patientsQuery.isLoading || doctorsQuery.isLoading) {
    return <LoadingState label="Loading form data..." />;
  }

  if (patientsQuery.isError || doctorsQuery.isError) {
    return <ErrorState message="Could not load patients or doctors." />;
  }

  const patients = patientsQuery.data?.data ?? [];
  const doctors = doctorsQuery.data?.data ?? [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = createAppointmentSchema.safeParse({
      patientId,
      doctorId,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : '',
      durationMinutes: Number(durationMinutes),
      reason,
      notes: notes.trim() ? notes : null,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      router.push(`${DASHBOARD_BASE_PATH}/appointments`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create appointment';
      setFormError(message);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Book appointment"
          description="Creates a new appointment through the mock API."
          action={
            <Link href={`${DASHBOARD_BASE_PATH}/appointments`}>
              <Button variant="secondary">Back</Button>
            </Link>
          }
        />

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Patient</span>
            <select
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Doctor</span>
            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
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

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Date & time</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium text-slate-700">Duration (minutes)</span>
            <input
              type="number"
              min={15}
              max={240}
              step={15}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
              required
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Reason</span>
            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Annual wellness visit"
              required
            />
          </label>

          <label className="grid gap-2 text-sm md:col-span-2">
            <span className="font-medium text-slate-700">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Optional notes"
            />
          </label>

          {formError ? (
            <p className="md:col-span-2 text-sm text-red-600">{formError}</p>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Create appointment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
