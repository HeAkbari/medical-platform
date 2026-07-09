'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import {
  HEALTH_CONDITION_MILESTONES,
  MOCK_AVAILABILITY_SLOTS,
  MOCK_PROVIDER_VISIT_HISTORY,
  MOCK_REBOOKING_HISTORY,
  VISIT_DELIVERY_METHODS,
} from '@/features/healthcare-team/data/mock-healthcare-team';
import { HealthConditionMeter } from '@/features/healthcare-team/ui/health-condition-meter';
import { useHealthcareTeamStore } from '@/features/healthcare-team/store/healthcare-team-store';
import { useAppointmentBookingStore } from '@/features/appointments/store/appointment-booking-store';
import { useDoctorsQuery } from '@/hooks';

const PHYSICIAN_CATEGORIES = [
  { label: 'Family Physician', icon: '🏥' },
  { label: 'Internist', icon: '🩺' },
  { label: 'Cardiologist', icon: '❤️' },
  { label: 'Dermatologist', icon: '🧴' },
  { label: 'Pediatrician', icon: '👶' },
  { label: 'Gynecologist', icon: '🩻' },
  { label: 'Psychiatrist', icon: '🧠' },
  { label: 'Other', icon: '🔍' },
];

function formatVisitDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HealthcareTeamPage() {
  const familyPhysicianId = useHealthcareTeamStore(
    (state) => state.familyPhysicianId
  );
  const setFamilyPhysicianId = useHealthcareTeamStore(
    (state) => state.setFamilyPhysicianId
  );
  const openBooking = useAppointmentBookingStore((state) => state.openBooking);
  const { data, isLoading, isError } = useDoctorsQuery();

  const doctors = data?.data ?? [];
  const familyPhysician = doctors.find((doctor) => doctor.id === familyPhysicianId);
  const familyMedicineDoctor = doctors.find(
    (doctor) => doctor.specialty === 'Family Medicine'
  );

  const milestones = useMemo(() => {
    return HEALTH_CONDITION_MILESTONES.map((milestone) =>
      milestone.id === 'family-physician'
        ? { ...milestone, complete: Boolean(familyPhysicianId) }
        : milestone
    );
  }, [familyPhysicianId]);

  if (isLoading) {
    return <LoadingState label="Loading healthcare team..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load healthcare team." />;
  }

  function handleBookWithProvider(doctorId: string) {
    openBooking({ doctorId });
  }

  function handleRebook(doctorId: string | undefined) {
    if (doctorId) {
      openBooking({ doctorId });
    } else {
      openBooking();
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Your Healthcare Team
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your family physician, visit history, and care milestones.
        </p>
      </header>

      <Card>
        <CardHeader
          title="Family physician"
          description="Your designated primary care provider."
        />

        {familyPhysician ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted p-4 border-border bg-muted/60">
              <p className="text-lg font-semibold text-foreground">
                Dr. {familyPhysician.firstName} {familyPhysician.lastName}
              </p>
              <p className="mt-1 text-sm text-brand">{familyPhysician.specialty}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {familyPhysician.phone}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-subtle-foreground">
                Next available slots
              </p>
              <ul className="flex flex-wrap gap-2">
                {MOCK_AVAILABILITY_SLOTS.map((slot) => (
                  <li key={slot}>
                    <Badge variant="muted">{slot}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-subtle-foreground">
                Visit delivery methods
              </p>
              <ul className="flex flex-wrap gap-2">
                {VISIT_DELIVERY_METHODS.map((method) => (
                  <li key={method}>
                    <span className="inline-flex rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand-dark bg-brand/20 text-brand-light">
                      {method}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="button"
              fullWidth
              onClick={() => handleBookWithProvider(familyPhysician.id)}
            >
              Book an appointment with this provider
            </Button>

            {MOCK_PROVIDER_VISIT_HISTORY.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium text-subtle-foreground">
                  Visit history with this provider
                </p>
                <ul className="space-y-2">
                  {MOCK_PROVIDER_VISIT_HISTORY.map((visit) => (
                    <li
                      key={visit.id}
                      className="rounded-xl border border-border px-3 py-3 text-sm border-border"
                    >
                      <p className="font-medium text-foreground">
                        {visit.reason}
                      </p>
                      <p className="mt-1 text-faint-foreground">
                        {formatVisitDate(visit.visitedAt)} · {visit.visitType}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add a physician to your care team. Choose a specialty:
            </p>
            {/* Add a Physician — 2-column grid picker (v0.4) */}
            <ul className="grid grid-cols-2 gap-2">
              {PHYSICIAN_CATEGORIES.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={`/home/find-physician?specialty=${encodeURIComponent(cat.label)}`}
                    className="flex min-h-18 flex-col items-start justify-between gap-1 rounded-xl border border-border bg-card p-3 transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.98]"
                  >
                    <span className="text-lg" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span className="text-sm font-medium text-foreground leading-snug">
                      {cat.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {familyMedicineDoctor ? (
              <Button
                type="button"
                fullWidth
                onClick={() => setFamilyPhysicianId(familyMedicineDoctor.id)}
              >
                Add {familyMedicineDoctor.firstName}{' '}
                {familyMedicineDoctor.lastName}
              </Button>
            ) : null}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Re-booking history"
          description="One-tap renewal from past visits."
        />
        {MOCK_REBOOKING_HISTORY.length === 0 ? (
          <EmptyState title="No past visits to re-book" />
        ) : (
          <ul className="space-y-2">
            {MOCK_REBOOKING_HISTORY.map((visit) => {
              const doctor = doctors.find((item) =>
                visit.providerName.includes(item.lastName)
              );

              return (
                <li
                  key={visit.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {visit.providerName}
                    </p>
                    <p className="mt-1 text-sm text-faint-foreground">
                      {visit.reason} · {formatVisitDate(visit.visitedAt)}
                    </p>
                    <p className="text-sm text-faint-foreground">
                      {visit.visitType}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleRebook(doctor?.id)}
                  >
                    Book again
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Health Screening"
          description="Track milestones recommended for your care plan."
        />
        <HealthConditionMeter milestones={milestones} />
      </Card>
    </div>
  );
}
