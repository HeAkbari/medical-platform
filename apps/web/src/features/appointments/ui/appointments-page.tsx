'use client';

import Link from 'next/link';
import { useAppointmentsQuery } from '@/hooks';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';

function statusVariant(status: string) {
  if (status === 'completed') {
    return 'success' as const;
  }

  if (status === 'cancelled') {
    return 'muted' as const;
  }

  return 'default' as const;
}

export function AppointmentsPage() {
  const { data, isLoading, isError } = useAppointmentsQuery();

  if (isLoading) {
    return <LoadingState label="Loading appointments..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load appointments." />;
  }

  const appointments = data?.data ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader
          title="Appointments"
          description="All appointments from the mock API."
          action={
            <Link href="/dashboard/appointments/new">
              <Button fullWidth>Book appointment</Button>
            </Link>
          }
        />
        {appointments.length === 0 ? (
          <EmptyState title="No appointments found" />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-xl border border-slate-200 p-3 sm:p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {appointment.reason}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(appointment.scheduledAt).toLocaleString()} ·{' '}
                      {appointment.durationMinutes} min
                    </p>
                  </div>
                  <Badge variant={statusVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                {appointment.notes ? (
                  <p className="mt-2 text-sm text-slate-600">
                    {appointment.notes}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
