'use client';

import { useState } from 'react';
import { createAppointmentSchema } from '@medical-platform/domain/validation';
import {
  useCreateAppointmentMutation,
  usePatientsQuery,
} from '@/hooks';
import { Button, ErrorState, LoadingState } from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';

interface AppointmentBookingFormProps {
  doctorId: string;
  doctorLabel: string;
  initialPatientId?: string;
  showDoctorSummary?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentBookingForm({
  doctorId,
  doctorLabel,
  initialPatientId = '',
  showDoctorSummary = true,
  onSuccess,
  onCancel,
}: AppointmentBookingFormProps) {
  const patientsQuery = usePatientsQuery();
  const createMutation = useCreateAppointmentMutation();

  const [patientId, setPatientId] = useState(initialPatientId);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (patientsQuery.isLoading) {
    return <LoadingState label="Loading form data..." />;
  }

  if (patientsQuery.isError) {
    return <ErrorState message="Could not load patients." />;
  }

  const patients = patientsQuery.data?.data ?? [];

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
      setIsSubmitted(true);
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not create appointment';
      setFormError(message);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-6 text-center">
        <p className="font-medium text-teal-900">Appointment booked</p>
        <p className="mt-1 text-sm text-teal-800">
          Your appointment with {doctorLabel} has been created.
        </p>
        {onCancel ? (
          <Button
            variant="secondary"
            fullWidth
            className="mt-4"
            onClick={onCancel}
          >
            Close
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {showDoctorSummary ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Doctor
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">{doctorLabel}</p>
        </div>
      ) : null}

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Patient</span>
        <select
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          className={inputClassName}
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

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Date & time</span>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">
          Duration (minutes)
        </span>
        <input
          type="number"
          min={15}
          max={240}
          step={15}
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Reason</span>
        <input
          type="text"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className={inputClassName}
          placeholder="Annual wellness visit"
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="Optional notes"
        />
      </label>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

      <div className={onCancel ? 'grid grid-cols-2 gap-3' : undefined}>
        {onCancel ? (
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending} fullWidth>
          {createMutation.isPending ? 'Saving...' : 'Book appointment'}
        </Button>
      </div>
    </form>
  );
}
