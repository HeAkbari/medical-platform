'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
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
import type { Doctor } from '@medical-platform/domain';

type PhysicianCategoryId =
  | 'family-physician'
  | 'dentist'
  | 'physiotherapist'
  | 'optometrist'
  | 'specialist'
  | 'mental-health';

interface PhysicianCategory {
  id: PhysicianCategoryId;
  label: string;
  description: string;
  /** Query value for /find-physician — omitted when category is not patient-addable. */
  specialtyQuery?: string;
  /** Family physician is assigned by clinic; shown with solid border and no add action. */
  addable: boolean;
}

const PHYSICIAN_CATEGORIES: PhysicianCategory[] = [
  {
    id: 'family-physician',
    label: 'Family Physician',
    description: 'GPs accepting patients',
    addable: false,
  },
  {
    id: 'dentist',
    label: 'Dentist',
    description: 'Cleanings & dental care',
    specialtyQuery: 'Dentist',
    addable: true,
  },
  {
    id: 'physiotherapist',
    label: 'Physiotherapist',
    description: 'Movement & rehab',
    specialtyQuery: 'Physiotherapist',
    addable: true,
  },
  {
    id: 'optometrist',
    label: 'Optometrist',
    description: 'Eye exams & vision',
    specialtyQuery: 'Optometrist',
    addable: true,
  },
  {
    id: 'specialist',
    label: 'Specialist',
    description: 'Cardiology, derm & more',
    specialtyQuery: 'Specialist',
    addable: true,
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    description: 'Counsellors & psychologists',
    specialtyQuery: 'Mental Health',
    addable: true,
  },
];

function CategoryIcon({ id }: { id: PhysicianCategoryId }) {
  const common = 'h-5 w-5';

  switch (id) {
    case 'family-physician':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M6 4v6a6 6 0 0 0 12 0V4" strokeLinecap="round" />
          <path d="M9 4h6" strokeLinecap="round" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M18 10v5.5" strokeLinecap="round" />
        </svg>
      );
    case 'dentist':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M8 4c-1.5 0-2.5 1.2-2.5 2.8 0 2.2 1 4.2 2 6.2.6 1.2.8 2.4.8 3.5V20h2.4v-3.5c0-1.1.2-2.3.8-3.5 1-2 2-4 2-6.2C15.5 5.2 14.5 4 13 4c-1 0-1.7.5-2.5.5S9 4 8 4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'physiotherapist':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M8 14c-1.5 1-2.5 2.8-2 4.5.4 1.2 1.6 2 3 1.5 1.2-.4 2-1.6 2-3V8" strokeLinecap="round" />
          <path d="M16 14c1.5 1 2.5 2.8 2 4.5-.4 1.2-1.6 2-3 1.5-1.2-.4-2-1.6-2-3V8" strokeLinecap="round" />
          <circle cx="10" cy="6" r="1.5" />
          <circle cx="14" cy="6" r="1.5" />
        </svg>
      );
    case 'optometrist':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'specialist':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M12 20s-6.5-4.2-6.5-9.2A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 6.5 3.8C18.5 15.8 12 20 12 20z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'mental-health':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path d="M9 18h6M10 21h4" strokeLinecap="round" />
          <path d="M12 3a6 6 0 0 0-3.5 10.8V16h7v-2.2A6 6 0 0 0 12 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function PlusIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function AddPhysicianCategoryCard({ category }: { category: PhysicianCategory }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <CategoryIcon id={category.id} />
        </span>
        {category.addable ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
            <PlusIcon />
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-foreground">{category.label}</p>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          {category.description}
        </p>
      </div>
    </>
  );

  const cardClassName = category.addable
    ? 'flex h-full flex-col rounded-2xl border border-dashed border-border bg-card p-3.5 transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.98]'
    : 'flex h-full flex-col rounded-2xl border border-border bg-card p-3.5';

  if (!category.addable || !category.specialtyQuery) {
    return (
      <div className={cardClassName} aria-label={`${category.label} — assigned by your clinic`}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/find-physician?specialty=${encodeURIComponent(category.specialtyQuery)}`}
      className={cardClassName}
    >
      {content}
    </Link>
  );
}

const TEAM_CARD_META = [
  { rating: 4.9, distanceKm: 1.2 },
  { rating: 4.8, distanceKm: 0.8 },
  { rating: 4.7, distanceKm: 2.1 },
] as const;

function formatVisitDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-amber-400"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function PhysicianAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-xs font-bold text-brand-foreground"
      aria-hidden="true"
    >
      {firstName.charAt(0)}
      {lastName.charAt(0)}
    </div>
  );
}

function TeamPhysicianCard({
  doctor,
  rating,
  distanceKm,
  isFamilyPhysician,
  onOpen,
  onBook,
}: {
  doctor: Doctor;
  rating: number;
  distanceKm: number;
  isFamilyPhysician: boolean;
  onOpen: () => void;
  onBook: () => void;
}) {
  return (
    <Card className="flex h-full items-center gap-2.5 border-brand-subtle/70 p-3 sm:p-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <PhysicianAvatar
          firstName={doctor.firstName}
          lastName={doctor.lastName}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-h-5 items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-foreground">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
            {isFamilyPhysician ? (
              <Badge
                variant="default"
                className="shrink-0 px-1.5 py-0 text-[10px] uppercase tracking-wide"
              >
                Family
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {doctor.specialty}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-medium text-subtle-foreground">
              <StarIcon />
              {rating.toFixed(1)}
            </span>
            <span className="text-faint-foreground">
              {distanceKm.toFixed(1)} km
            </span>
          </div>
        </div>
      </button>
      <Button
        type="button"
        className="min-h-9 shrink-0 rounded-xl px-3.5 py-2 text-sm"
        onClick={onBook}
      >
        Book
      </Button>
    </Card>
  );
}

function PhysicianDetailDrawer({
  doctor,
  isFamilyPhysician,
  open,
  onOpenChange,
  onBook,
  onRemove,
}: {
  doctor: Doctor | null;
  isFamilyPhysician: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: () => void;
  onRemove?: () => void;
}) {
  const visitHistory = doctor
    ? MOCK_PROVIDER_VISIT_HISTORY.filter((visit) =>
        visit.providerName.includes(doctor.lastName)
      )
    : [];

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange} variant="tall">
      <Drawer.Title className="sr-only">
        {doctor
          ? `Dr. ${doctor.firstName} ${doctor.lastName}`
          : 'Physician details'}
      </Drawer.Title>

      {!doctor ? null : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {isFamilyPhysician ? 'Family physician' : 'Care team'}
            </p>
            {isFamilyPhysician ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Assigned by your clinic — view only.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-border bg-muted/60 p-4">
            <p className="text-lg font-semibold text-foreground">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
            <p className="mt-1 text-sm text-brand">{doctor.specialty}</p>
            <p className="mt-2 text-sm text-muted-foreground">{doctor.phone}</p>
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
                  <span className="inline-flex rounded-full bg-brand/20 px-2.5 py-1 text-xs font-medium text-brand-light">
                    {method}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button type="button" fullWidth onClick={onBook}>
            Book an appointment with this provider
          </Button>

          {!isFamilyPhysician && onRemove ? (
            <Button type="button" variant="ghost" fullWidth onClick={onRemove}>
              Remove from care team
            </Button>
          ) : null}

          {visitHistory.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-subtle-foreground">
                Visit history with this provider
              </p>
              <ul className="space-y-2">
                {visitHistory.map((visit) => (
                  <li
                    key={visit.id}
                    className="rounded-xl border border-border px-3 py-3 text-sm"
                  >
                    <p className="font-medium text-foreground">{visit.reason}</p>
                    <p className="mt-1 text-faint-foreground">
                      {formatVisitDate(visit.visitedAt)} · {visit.visitType}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </ResponsiveDrawer>
  );
}

export function HealthcareTeamPage() {
  const familyPhysicianId = useHealthcareTeamStore(
    (state) => state.familyPhysicianId
  );
  const teamMemberIds = useHealthcareTeamStore((state) => state.teamMemberIds);
  const removeTeamMember = useHealthcareTeamStore(
    (state) => state.removeTeamMember
  );
  const openBooking = useAppointmentBookingStore((state) => state.openBooking);
  const { data, isLoading, isError } = useDoctorsQuery();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const doctors = data?.data ?? [];
  const familyPhysician = doctors.find(
    (doctor) => doctor.id === familyPhysicianId
  );
  const teamMembers = doctors.filter((doctor) =>
    teamMemberIds.includes(doctor.id)
  );

  const teamPhysicians = useMemo(() => {
    const members = teamMembers.filter(
      (doctor) => doctor.id !== familyPhysicianId
    );
    return familyPhysician ? [familyPhysician, ...members] : members;
  }, [familyPhysician, familyPhysicianId, teamMembers]);

  const selectedDoctor =
    doctors.find((doctor) => doctor.id === selectedDoctorId) ?? null;
  const selectedIsFamilyPhysician = selectedDoctorId === familyPhysicianId;

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

  function handleRemoveFromTeam(doctorId: string) {
    removeTeamMember(doctorId);
    setSelectedDoctorId(null);
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
          View your assigned family physician and manage your care team.
        </p>
      </header>

      <section aria-labelledby="team-physicians-heading">
        <h2
          id="team-physicians-heading"
          className="mb-3 text-base font-semibold tracking-tight text-foreground"
        >
          Your physicians
        </h2>

        {teamPhysicians.length === 0 ? (
          <EmptyState
            title="No physicians on your team yet"
            description="Your clinic assigns your family physician. You can also add other physicians below."
          />
        ) : (
          <ul className="space-y-2">
            {teamPhysicians.map((doctor, index) => {
              const meta = TEAM_CARD_META[index] ?? TEAM_CARD_META[1];

              return (
                <li key={doctor.id} className="h-[4.5rem]">
                  <TeamPhysicianCard
                    doctor={doctor}
                    rating={meta.rating}
                    distanceKm={meta.distanceKm}
                    isFamilyPhysician={doctor.id === familyPhysicianId}
                    onOpen={() => setSelectedDoctorId(doctor.id)}
                    onBook={() => handleBookWithProvider(doctor.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="add-physician-heading">
        <h2
          id="add-physician-heading"
          className="mb-3 text-base font-semibold tracking-tight text-foreground"
        >
          Add a Physician
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {PHYSICIAN_CATEGORIES.map((category) => (
            <li key={category.id}>
              <AddPhysicianCategoryCard category={category} />
            </li>
          ))}
        </ul>
      </section>

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
                  className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
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

      <PhysicianDetailDrawer
        doctor={selectedDoctor}
        isFamilyPhysician={selectedIsFamilyPhysician}
        open={selectedDoctorId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDoctorId(null);
        }}
        onBook={() => {
          if (selectedDoctorId) {
            handleBookWithProvider(selectedDoctorId);
          }
        }}
        onRemove={
          selectedDoctorId && !selectedIsFamilyPhysician
            ? () => handleRemoveFromTeam(selectedDoctorId)
            : undefined
        }
      />
    </div>
  );
}
