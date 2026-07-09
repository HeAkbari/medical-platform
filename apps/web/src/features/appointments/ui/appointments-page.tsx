'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Appointment } from '@medical-platform/domain';
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
  if (status === 'completed') return 'success' as const;
  if (status === 'cancelled') return 'muted' as const;
  return 'default' as const;
}

function formatRelativeDate(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (diffDays === 0) return `Today · ${timeStr}`;
  if (diffDays === 1) return `Tomorrow · ${timeStr}`;
  if (diffDays === -1) return `Yesterday · ${timeStr}`;
  if (diffDays > 1 && diffDays <= 6) return `In ${diffDays} days · ${timeStr}`;
  if (diffDays < -1 && diffDays >= -6) return `${Math.abs(diffDays)} days ago · ${timeStr}`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 || diffDays < -365 ? 'numeric' : undefined,
  }) + ` · ${timeStr}`;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onSelect: (id: string) => void;
}

function AppointmentCard({ appointment, onSelect }: AppointmentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition hover:border-brand-subtle hover:shadow-sm">
      <button
        type="button"
        onClick={() => onSelect(appointment.id)}
        className="w-full p-3 text-left sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-medium text-foreground">{appointment.reason}</p>
            <p className="mt-1 text-sm text-faint-foreground">
              {formatRelativeDate(appointment.scheduledAt)} · {appointment.durationMinutes} min
            </p>
            {appointment.locationName ? (
              <p className="mt-0.5 text-sm text-faint-foreground">
                {appointment.locationName}
              </p>
            ) : null}
            {/* Expertise chips */}
            {(appointment.specialty || appointment.appointmentType) ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {appointment.specialty ? (
                  <span className="inline-flex rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-dark">
                    {appointment.specialty}
                  </span>
                ) : null}
                {appointment.appointmentType ? (
                  <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {appointment.appointmentType}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          <Badge variant={statusVariant(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </button>
      {/* Tap physician name → P9 */}
      {appointment.doctorName ? (
        <Link
          href={`/physicians/${appointment.doctorId}`}
          className="flex items-center justify-between border-t border-border px-3 py-2 transition hover:bg-accent sm:px-4"
        >
          <span className="text-sm font-medium text-brand">
            {appointment.doctorName}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-faint-foreground" aria-hidden="true">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
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

  const { upcoming, past } = useMemo(() => {
    const all = data?.data ?? [];
    const now = new Date();
    const u = all.filter(
      (a) => a.status !== 'cancelled' && new Date(a.scheduledAt) >= now
    );
    const p = all.filter(
      (a) => a.status === 'cancelled' || new Date(a.scheduledAt) < now
    );
    return { upcoming: u, past: p };
  }, [data?.data]);

  if (isLoading) return <LoadingState label="Loading appointments..." />;
  if (isError) return <ErrorState message="Could not load appointments." />;

  return (
    <div className="space-y-4">
      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>

      {/* Header + CTAs */}
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
      </Card>

      {/* Upcoming */}
      <section aria-labelledby="upcoming-heading">
        <h2
          id="upcoming-heading"
          className="mb-2 text-sm font-semibold text-subtle-foreground"
        >
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState title="No upcoming appointments" />
        ) : (
          <div className="space-y-3">
            {upcoming.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 ? (
        <section aria-labelledby="past-heading">
          <h2
            id="past-heading"
            className="mb-2 text-sm font-semibold text-subtle-foreground"
          >
            Past &amp; cancelled
          </h2>
          <div className="space-y-3">
            {past.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </section>
      ) : null}

      <AppointmentDetailDrawer
        appointmentId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
