'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppointmentsQuery } from '@/hooks';
import { useAppointmentBookingStore } from '@/features/appointments/store/appointment-booking-store';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { AppointmentDetailDrawer } from './appointment-detail-drawer';

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
  const openBooking = useAppointmentBookingStore((state) => state.openBooking);
  const { requireAuth } = useRequireAuth();
  const { data, isLoading, isError } = useAppointmentsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleBookAppointment() {
    requireAuth({ type: 'book-appointment' }, () => {
      openBooking();
    });
  }

  if (isLoading) {
    return <LoadingState label="Loading appointments..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load appointments." />;
  }

  const appointments = data?.data ?? [];

  return (
    <div className="space-y-4">
      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>

      <Card>
        <CardHeader
          title="Appointments"
          description="View, book, or manage your GP appointments."
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link href="/home/map" className="inline-flex">
                <Button variant="secondary" fullWidth>
                  Find on map
                </Button>
              </Link>
              <Button type="button" fullWidth onClick={handleBookAppointment}>
                Book appointment
              </Button>
            </div>
          }
        />
        {appointments.length === 0 ? (
          <EmptyState title="No appointments found" />
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const meta = [
                appointment.doctorName,
                appointment.locationName,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => setSelectedId(appointment.id)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
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
                      {meta ? (
                        <p className="mt-0.5 text-sm text-slate-500">{meta}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {appointment.appointmentType ? (
                        <span className="inline-flex rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-dark">
                          {appointment.appointmentType}
                        </span>
                      ) : null}
                      <Badge variant={statusVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <AppointmentDetailDrawer
        appointmentId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      />
    </div>
  );
}
