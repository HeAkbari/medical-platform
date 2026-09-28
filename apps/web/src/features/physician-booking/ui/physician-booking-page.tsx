'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createAppointmentSchema } from '@medical-platform/domain/validation';
import { Button, Card, ErrorState, LoadingState } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import { useAuthRedirectStore } from '@/features/auth/store/auth-redirect-store';
import { PhysicianAvatar } from '@/features/doctors';
import {
  useBackNavigation,
  useCreateAppointmentMutation,
  useDoctorAvailableSlotsQuery,
  useDoctorsQuery,
  useDoctorWorkingDaysQuery,
} from '@/hooks';
import type { AvailableSlot } from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import { formatClinicTime } from '@/lib/format-time';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return cells;
}

const VISIT_TYPE_OPTIONS = [
  { key: 'walkIn', label: 'Walk-in' },
  { key: 'virtual', label: 'Virtual' },
  { key: 'phone', label: 'Phone' },
] as const;

type VisitType = (typeof VISIT_TYPE_OPTIONS)[number]['key'];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const formatSlotLabel = formatClinicTime;

interface PhysicianBookingPageProps {
  doctorId: string;
}

export function PhysicianBookingPage({ doctorId }: PhysicianBookingPageProps) {
  const router = useRouter();
  const handleBack = useBackNavigation(`/physicians/${doctorId}`);
  const { data, isLoading, isError } = useDoctorsQuery();
  const { user, isLoading: isAuthLoading } = useAuth();
  const setPendingAction = useAuthRedirectStore((state) => state.setPendingAction);
  const createMutation = useCreateAppointmentMutation();

  // replace (not push) so Back from /login returns to the physician page
  // instead of bouncing straight back here and redirecting again.
  useEffect(() => {
    if (isAuthLoading || user) return;
    setPendingAction({ type: 'navigate', href: `/physicians/${doctorId}/book` });
    router.replace('/login');
  }, [isAuthLoading, user, doctorId, router, setPendingAction]);

  const doctor = useMemo(
    () => data?.data.find((d) => d.id === doctorId),
    [data?.data, doctorId],
  );

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  // Filters real availability by this clinic's real OSCAR schedule codes
  // (walkIn=67, phone=80) — see VISIT_TYPE_TO_SCHEDULE_CODE in
  // apps/web/src/lib/doctors/availability.ts. `virtual` has no real code
  // yet, so it always resolves to an empty schedule (button stays, by
  // design — see docs/oscar/new-approach/oscar-soap-schedule-services.md).
  const [visitType, setVisitType] = useState<VisitType>('walkIn');
  const [reasonNote, setReasonNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const workingDaysQuery = useDoctorWorkingDaysQuery(doctorId, currentYear, currentMonth, visitType);
  const availableDays = useMemo(
    () => new Set(workingDaysQuery.data?.data.workingDays ?? []),
    [workingDaysQuery.data],
  );

  const selectedDateKey = selectedDay ? toDateKey(currentYear, currentMonth, selectedDay) : null;
  const slotsQuery = useDoctorAvailableSlotsQuery(doctorId, selectedDateKey, visitType);
  const todaysSlotsQuery = useDoctorAvailableSlotsQuery(
    doctorId,
    toDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    visitType,
  );
  const firstAvailableToday = todaysSlotsQuery.data?.data.slots[0];

  async function handleConfirm() {
    if (!user || !selectedSlot) return;

    setFormError(null);

    // A real name + DOB is required to find/provision this patient in the
    // clinic's EMR (see EnsurePatientLinkedToClinicUseCase) — send them to
    // complete their profile rather than let the booking call fail.
    if (!user.firstName.trim() || !user.lastName.trim() || !user.dateOfBirth) {
      router.push('/profile');
      return;
    }

    const parsed = createAppointmentSchema.safeParse({
      patientId: user.patientId,
      doctorId,
      scheduledAt: selectedSlot.start,
      durationMinutes: selectedSlot.durationMinutes,
      reason: reasonNote.trim() || 'Appointment',
      notes: null,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Invalid booking details');
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      setIsSubmitted(true);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not create appointment',
      );
    }
  }

  const calendarCells = useMemo(
    () => buildCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  function handleSelectVisitType(key: VisitType) {
    setVisitType(key);
    setSelectedSlot(null);
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
    setSelectedSlot(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
    setSelectedSlot(null);
  }

  function handleSelectDay(day: number) {
    if (!availableDays.has(day)) return;
    setSelectedDay(day);
    setSelectedSlot(null);
  }

  if (isAuthLoading) return <LoadingState label="Checking session..." />;
  if (!user) return <LoadingState label="Redirecting to sign in..." />;
  if (isLoading) return <LoadingState label="Loading booking..." />;
  if (isError || !doctor) return <ErrorState message="Physician not found." />;

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-brand-subtle bg-brand-muted px-4 py-6 text-center">
        <p className="font-medium text-brand-darker">Appointment booked</p>
        <p className="mt-1 text-sm text-brand-dark">
          Your appointment with Dr. {doctor.firstName} {doctor.lastName} has
          been created.
        </p>
        <Link href="/services/appointments" className="mt-4 block">
          <Button variant="secondary" fullWidth>
            View appointments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex min-h-9 items-center text-sm font-medium text-brand"
      >
        ← Back
      </button>

      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Book appointment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a visit type, date, and time with this physician.
        </p>
      </header>

      <Link
        href={`/physicians/${doctorId}`}
        className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 transition hover:border-brand-subtle active:opacity-80"
      >
        <PhysicianAvatar
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          doctorId={doctor.id}
          size="md"
          shape="circle"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <p className="truncate text-xs text-brand">{doctor.specialty}</p>
          {doctor.clinicName ? (
            <p className="truncate text-xs text-faint-foreground">
              {doctor.clinicName}
            </p>
          ) : null}
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="ms-auto h-3.5 w-3.5 shrink-0 text-faint-foreground"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="rounded-xl border border-border bg-card p-2.5">
        <div className="flex items-center gap-2">
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-faint-foreground">
            Visit type
          </p>
          <div
            role="radiogroup"
            aria-label="Visit type"
            className="flex min-w-0 flex-1 gap-1.5"
          >
            {VISIT_TYPE_OPTIONS.map((option) => {
              const active = visitType === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleSelectVisitType(option.key)}
                  className={cn(
                    'min-h-8 flex-1 rounded-lg px-2 text-xs font-medium transition active:scale-[0.98]',
                    active
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {firstAvailableToday ? (
        <div className="flex items-center gap-2 rounded-xl border border-brand-subtle bg-brand-muted/40 px-2.5 py-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5 shrink-0 text-brand"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
          <p className="text-xs font-medium text-brand-dark">
            First available today:{' '}
            <span className="font-semibold">{formatSlotLabel(firstAvailableToday.start)}</span>
          </p>
        </div>
      ) : null}

      <Card className="p-3 sm:p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent"
            aria-label="Previous month"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <p className="text-xs font-semibold text-foreground">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </p>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent"
            aria-label="Next month"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                d="M9 18l6-6-6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="mb-0.5 grid grid-cols-7 gap-0.5">
          {DAY_LABELS.map((day) => (
            <div
              key={day}
              className="py-0.5 text-center text-[10px] font-semibold uppercase text-faint-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {calendarCells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const available = availableDays.has(day);
            const selected = selectedDay === day;
            const isPast =
              new Date(currentYear, currentMonth, day) <
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
              );

            return (
              <button
                key={day}
                type="button"
                disabled={!available || isPast}
                onClick={() => handleSelectDay(day)}
                className={`flex h-8 items-center justify-center rounded-md text-xs font-medium transition
                  ${selected ? 'bg-brand text-brand-foreground' : ''}
                  ${
                    !selected && available && !isPast
                      ? 'bg-brand-muted text-brand-dark hover:bg-brand-light hover:text-brand-foreground'
                      : ''
                  }
                  ${
                    !available || isPast
                      ? 'cursor-default text-faint-foreground'
                      : ''
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap gap-2.5 text-[10px] text-faint-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-muted" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
            Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
            Unavailable
          </span>
        </div>

        {selectedDay ? (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-faint-foreground">
              {MONTH_NAMES[currentMonth]} {selectedDay} — Timeslots
            </p>
            {slotsQuery.isLoading ? (
              <p className="text-[11px] text-faint-foreground">Checking availability...</p>
            ) : slotsQuery.data?.data.slots.length ? (
              <div className="grid grid-cols-4 gap-1.5">
                {slotsQuery.data.data.slots.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-md border px-1 py-1.5 text-[11px] font-medium transition
                      ${
                        selectedSlot?.start === slot.start
                          ? 'border-brand bg-brand text-brand-foreground'
                          : 'border-border text-foreground hover:border-brand-subtle hover:bg-brand-muted'
                      }
                    `}
                  >
                    {formatSlotLabel(slot.start)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-faint-foreground">
                No open times left on this day.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-faint-foreground">
            Select an available day to see time slots.
          </p>
        )}
      </Card>

      <Card className="p-3 sm:p-3">
        <label
          htmlFor="booking-reason"
          className="block text-xs font-semibold uppercase tracking-wide text-faint-foreground"
        >
          Reason for visit / Symptom
        </label>
        <textarea
          id="booking-reason"
          value={reasonNote}
          onChange={(e) => setReasonNote(e.target.value)}
          placeholder="e.g., stomach pain, doctor's note, etc."
          rows={2}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-muted/40 px-2.5 py-2 text-sm text-foreground placeholder:text-faint-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Card>

      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

      <Button
        fullWidth
        className="min-h-10"
        disabled={!selectedDay || !selectedSlot || createMutation.isPending}
        onClick={handleConfirm}
      >
        {createMutation.isPending
          ? 'Booking...'
          : selectedDay && selectedSlot
            ? `Confirm — ${MONTH_NAMES[currentMonth]} ${selectedDay} · ${formatSlotLabel(selectedSlot.start)}`
            : 'Select a date and time'}
      </Button>
    </div>
  );
}
