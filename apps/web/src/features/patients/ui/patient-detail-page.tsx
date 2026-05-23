'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppointmentsQuery, usePatientQuery } from '@/hooks';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  LoadingState,
} from '@/components/ui';

export function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;

  const patientQuery = usePatientQuery(patientId);
  const appointmentsQuery = useAppointmentsQuery({ patientId });

  if (patientQuery.isLoading) {
    return <LoadingState label="Loading patient..." />;
  }

  if (patientQuery.isError || !patientQuery.data?.data) {
    return <ErrorState message="Patient not found." />;
  }

  const patient = patientQuery.data.data;
  const appointments = appointmentsQuery.data?.data ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader
          title={`${patient.firstName} ${patient.lastName}`}
          description="Patient profile and related appointments."
          action={
            <Link href="/dashboard/patients">
              <Button variant="secondary" fullWidth>
                Back
              </Button>
            </Link>
          }
        />
        <dl className="grid gap-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-1 break-all text-sm font-medium text-slate-900 sm:text-base">
              {patient.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Phone
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 sm:text-base">
              {patient.phone}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Date of birth
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 sm:text-base">
              {patient.dateOfBirth}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Appointments"
          description="Filtered by this patient."
          action={
            <Link href={`/dashboard/appointments/new?patientId=${patient.id}`}>
              <Button fullWidth>Book appointment</Button>
            </Link>
          }
        />
        {appointmentsQuery.isLoading ? (
          <LoadingState label="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-medium text-slate-900">
                    {appointment.reason}
                  </p>
                  <Badge
                    variant={
                      appointment.status === 'completed' ? 'success' : 'default'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(appointment.scheduledAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
