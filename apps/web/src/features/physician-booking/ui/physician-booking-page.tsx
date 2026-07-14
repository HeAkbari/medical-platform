'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button, Card, ErrorState, LoadingState } from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { PhysicianAvatar } from '@/features/doctors';
import { useDoctorsQuery } from '@/hooks';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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

/** Mock: every Monday, Wednesday, Friday is available this month */
function getMockAvailableDays(year: number, month: number): Set<number> {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const result = new Set<number>();

  for (let d = 1; d <= totalDays; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow === 1 || dow === 3 || dow === 5) result.add(d);
  }

  return result;
}

const MOCK_TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
];

interface PhysicianBookingPageProps {
  doctorId: string;
}

export function PhysicianBookingPage({ doctorId }: PhysicianBookingPageProps) {
  const { data, isLoading, isError } = useDoctorsQuery();

  const doctor = useMemo(
    () => data?.data.find((d) => d.id === doctorId),
    [data?.data, doctorId]
  );

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [visitTypes, setVisitTypes] = useState({
    walkIn: true,
    virtual: true,
    phone: true,
  });
  const [reasonNote, setReasonNote] = useState('');

  const availableDays = useMemo(
    () => getMockAvailableDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const calendarCells = useMemo(
    () => buildCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const anyTypeOn = visitTypes.walkIn || visitTypes.virtual || visitTypes.phone;

  function toggleVisitType(key: keyof typeof visitTypes) {
    setVisitTypes((prev) => ({ ...prev, [key]: !prev[key] }));
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

  if (isLoading) return <LoadingState label="Loading booking..." />;
  if (isError || !doctor) return <ErrorState message="Physician not found." />;

  const firstAvailableLabel = anyTypeOn
    ? `Today · 2:30 PM`
    : null;

  return (
    <div className="space-y-4 pb-6">
      <Link
        href={`/physicians/${doctorId}`}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back
      </Link>

      {/* Physician header — tap name/photo → P9 */}
      <Link
        href={`/physicians/${doctorId}`}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-brand-subtle active:opacity-80"
      >
        <PhysicianAvatar
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          doctorId={doctor.id}
          size="lg"
          shape="circle"
        />
        <div className="min-w-0">
          <p className="font-semibold text-foreground">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <p className="mt-0.5 text-sm text-brand">{doctor.specialty}</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="ms-auto h-4 w-4 shrink-0 text-faint-foreground" aria-hidden="true">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Visit-type toggles (all default On) */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-foreground">Visit type</p>
        <div className="space-y-3">
          <Switch
            label="Walk-in"
            checked={visitTypes.walkIn}
            onCheckedChange={() => toggleVisitType('walkIn')}
          />
          <Switch
            label="Virtual"
            checked={visitTypes.virtual}
            onCheckedChange={() => toggleVisitType('virtual')}
          />
          <Switch
            label="Phone"
            checked={visitTypes.phone}
            onCheckedChange={() => toggleVisitType('phone')}
          />
        </div>
        {!anyTypeOn ? (
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
            Enable at least one visit type to see availability.
          </p>
        ) : null}
      </Card>

      {/* First availability */}
      {anyTypeOn ? (
        <div className="flex items-center gap-2 rounded-xl border border-brand-subtle bg-brand-muted/40 px-3 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-brand" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-brand-dark">
            First available: <span className="font-semibold">{firstAvailableLabel}</span>
          </p>
        </div>
      ) : null}

      {/* Calendar + timeslots */}
      {anyTypeOn ? (
        <Card>
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent"
              aria-label="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-sm font-semibold text-foreground">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent"
              aria-label="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {DAY_LABELS.map((day) => (
              <div key={day} className="py-1 text-center text-[10px] font-semibold uppercase text-faint-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }

              const available = availableDays.has(day);
              const selected = selectedDay === day;
              const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <button
                  key={day}
                  type="button"
                  disabled={!available || isPast}
                  onClick={() => handleSelectDay(day)}
                  className={`aspect-square rounded-lg text-sm font-medium transition
                    ${selected ? 'bg-brand text-brand-foreground' : ''}
                    ${!selected && available && !isPast ? 'bg-brand-muted text-brand-dark hover:bg-brand-light hover:text-brand-foreground' : ''}
                    ${(!available || isPast) ? 'text-faint-foreground cursor-default' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-faint-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-brand-muted" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-brand" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-muted" />
              Unavailable
            </span>
          </div>

          {/* Time slots */}
          {selectedDay ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint-foreground">
                {MONTH_NAMES[currentMonth]} {selectedDay} — Timeslots (PDT)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MOCK_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition
                      ${selectedSlot === slot
                        ? 'border-brand bg-brand text-brand-foreground'
                        : 'border-border text-foreground hover:border-brand-subtle hover:bg-brand-muted'}
                    `}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-faint-foreground">
              Select an available day to see time slots.
            </p>
          )}
        </Card>
      ) : null}

      {/* Reason for visit */}
      <Card>
        <label htmlFor="booking-reason" className="block text-sm font-semibold text-foreground">
          Reason for visit / Symptom
        </label>
        <textarea
          id="booking-reason"
          value={reasonNote}
          onChange={(e) => setReasonNote(e.target.value)}
          placeholder="e.g., stomach pain, doctor's note, etc."
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-faint-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </Card>

      {/* Book CTA */}
      <Button
        fullWidth
        disabled={!selectedDay || !selectedSlot || !anyTypeOn}
      >
        {selectedDay && selectedSlot
          ? `Confirm — ${MONTH_NAMES[currentMonth]} ${selectedDay} · ${selectedSlot}`
          : 'Select a date and time'}
      </Button>
    </div>
  );
}
