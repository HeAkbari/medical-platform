'use client';

import Link from 'next/link';
import { DASHBOARD_BASE_PATH } from '@/config';
import { useAppointmentsQuery } from '@/shared/hooks';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/ui';

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
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Appointments"
          description="All appointments from the mock backend API."
          action={
            <Link href={`${DASHBOARD_BASE_PATH}/appointments/new`}>
              <Button>Book appointment</Button>
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
                className="rounded-xl border border-slate-200 px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
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
                  <p className="mt-3 text-sm text-slate-600">{appointment.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
