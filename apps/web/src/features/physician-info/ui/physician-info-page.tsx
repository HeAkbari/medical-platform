'use client';

import Link from 'next/link';
import { Button, Card, ErrorState, LoadingState } from '@/components/ui';
import { PhysicianAvatar } from '@/features/doctors';
import { useHealthcareTeamStore } from '@/features/healthcare-team/store/healthcare-team-store';
import { useBackNavigation, useDoctorQuery } from '@/hooks';
import type { DoctorWorkingHours } from '@medical-platform/domain';

const WORKING_HOURS_ROWS: { key: keyof Exclude<DoctorWorkingHours, '24/7'>; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-muted'}`}
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </span>
  );
}

interface PhysicianInfoPageProps {
  doctorId: string;
}

export function PhysicianInfoPage({ doctorId }: PhysicianInfoPageProps) {
  const handleBack = useBackNavigation('/find-physician');
  const { data, isLoading, isError } = useDoctorQuery(doctorId);
  const familyPhysicianId = useHealthcareTeamStore((s) => s.familyPhysicianId);
  const teamMemberIds = useHealthcareTeamStore((s) => s.teamMemberIds);
  const addTeamMember = useHealthcareTeamStore((s) => s.addTeamMember);
  const removeTeamMember = useHealthcareTeamStore((s) => s.removeTeamMember);

  const doctor = data?.data;

  const isFamilyPhysician = familyPhysicianId === doctorId;
  const isInTeam = teamMemberIds.includes(doctorId);

  function toggleTeam() {
    if (isFamilyPhysician) return;
    if (isInTeam) {
      removeTeamMember(doctorId);
    } else {
      addTeamMember(doctorId);
    }
  }

  if (isLoading) return <LoadingState label="Loading physician info..." />;
  if (isError || !doctor) return <ErrorState message="Physician not found." />;

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back
      </button>

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <PhysicianAvatar
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          doctorId={doctor.id}
          size="xl"
          shape="circle"
          className="ring-4 ring-brand-muted"
        />
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Dr. {doctor.firstName} {doctor.lastName}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-brand">
            {doctor.specialty}
          </p>
          {doctor.clinicName ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {doctor.clinicName}
            </p>
          ) : null}
          {isFamilyPhysician ? (
            <p className="mt-1 text-xs font-medium text-brand">
              Your assigned family physician
            </p>
          ) : null}
          {doctor.averageRating != null ? (
            <div className="mt-2 flex items-center justify-center gap-2">
              <StarRating rating={doctor.averageRating} />
              <span className="text-sm text-muted-foreground">
                {doctor.averageRating.toFixed(1)} ({doctor.reviewCount} reviews)
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-faint-foreground italic">
              Not yet rated
            </p>
          )}
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-2">
        <Link href={`/physicians/${doctorId}/book`} className="block">
          <Button fullWidth>Book appointment</Button>
        </Link>
        {isFamilyPhysician ? (
          <p className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-center text-sm text-muted-foreground">
            Family physician is assigned by your clinic and cannot be changed
            here.
          </p>
        ) : (
          <Button variant="secondary" fullWidth onClick={toggleTeam}>
            {isInTeam ? 'In your team ✓' : 'Add to Your Healthcare Team'}
          </Button>
        )}
      </div>

      {/* Clinic */}
      {doctor.clinicName || doctor.clinicAddress ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
            Clinic
          </p>
          {doctor.clinicName ? (
            <p className="mt-1 font-medium text-foreground">{doctor.clinicName}</p>
          ) : null}
          {doctor.clinicAddress ? (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${doctor.clinicAddress.street}, ${doctor.clinicAddress.city}, ${doctor.clinicAddress.province} ${doctor.clinicAddress.postalCode}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block text-sm text-brand underline-offset-2 hover:underline"
            >
              {doctor.clinicAddress.street}, {doctor.clinicAddress.city} →
            </a>
          ) : null}
        </Card>
      ) : null}

      {/* Languages */}
      {doctor.languages && doctor.languages.length > 0 ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
            Languages
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {doctor.languages.map((lang) => (
              <span
                key={lang}
                className="rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand-dark"
              >
                {lang}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Working hours */}
      {doctor.workingHours ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
            Working Hours
          </p>
          {doctor.workingHours === '24/7' ? (
            <p className="mt-2 text-sm text-muted-foreground">Open 24/7</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {WORKING_HOURS_ROWS.map(({ key, label }) => {
                const hours = doctor.workingHours === '24/7' ? null : doctor.workingHours?.[key];
                return (
                  <li key={key} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground">{label}</span>
                    <span
                      className={`text-sm ${hours && hours !== 'Closed' ? 'text-muted-foreground' : 'text-faint-foreground italic'}`}
                    >
                      {hours ?? 'Closed'}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : null}

      {/* Reviews */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
            Reviews
          </p>
          {doctor.averageRating != null ? (
            <div className="flex items-center gap-1.5">
              <StarRating rating={doctor.averageRating} />
              <span className="text-sm font-medium text-foreground">
                {doctor.averageRating.toFixed(1)}
              </span>
            </div>
          ) : null}
        </div>
        {doctor.reviews && doctor.reviews.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {doctor.reviews.map((review, index) => (
              <li
                key={index}
                className="rounded-xl border border-border bg-muted/40 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {review.authorName ?? 'Anonymous'}
                  </span>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-faint-foreground">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-faint-foreground italic">No reviews yet</p>
        )}
      </Card>
    </div>
  );
}
