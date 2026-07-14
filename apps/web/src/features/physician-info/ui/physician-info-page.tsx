'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Button, Card, ErrorState, LoadingState } from '@/components/ui';
import { PhysicianAvatar } from '@/features/doctors';
import { useHealthcareTeamStore } from '@/features/healthcare-team/store/healthcare-team-store';
import {
  DEFAULT_PHYSICIAN_EXTRAS,
  type PhysicianExtras,
} from '@/features/physician-info/data/mock-physician-extras';
import { useDoctorsQuery } from '@/hooks';

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
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
  const { data, isLoading, isError } = useDoctorsQuery();
  const familyPhysicianId = useHealthcareTeamStore((s) => s.familyPhysicianId);
  const teamMemberIds = useHealthcareTeamStore((s) => s.teamMemberIds);
  const addTeamMember = useHealthcareTeamStore((s) => s.addTeamMember);
  const removeTeamMember = useHealthcareTeamStore((s) => s.removeTeamMember);

  const doctor = useMemo(
    () => data?.data.find((d) => d.id === doctorId),
    [data?.data, doctorId]
  );

  const extras: PhysicianExtras = DEFAULT_PHYSICIAN_EXTRAS;

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
    <div className="space-y-4 pb-6">
      <Link
        href="/find-physician"
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back
      </Link>

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-2 text-center">
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
          <p className="mt-0.5 text-sm font-medium text-brand">{doctor.specialty}</p>
          {isFamilyPhysician ? (
            <p className="mt-1 text-xs font-medium text-brand">
              Your assigned family physician
            </p>
          ) : null}
          <div className="mt-2 flex items-center justify-center gap-2">
            <StarRating rating={extras.rating} />
            <span className="text-sm text-muted-foreground">
              {extras.rating} ({extras.reviewCount} reviews)
            </span>
          </div>
          <p className="mt-1 text-xs text-faint-foreground">
            {extras.yearsOfExperience} years of experience
          </p>
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-2">
        <Link href={`/physicians/${doctorId}/book`} className="block">
          <Button fullWidth>Book appointment</Button>
        </Link>
        {isFamilyPhysician ? (
          <p className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-center text-sm text-muted-foreground">
            Family physician is assigned by your clinic and cannot be changed here.
          </p>
        ) : (
          <Button variant="secondary" fullWidth onClick={toggleTeam}>
            {isInTeam ? 'In your team ✓' : 'Add to Your Healthcare Team'}
          </Button>
        )}
      </div>

      {/* Clinic */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
          Clinic
        </p>
        <p className="mt-1 font-medium text-foreground">{extras.clinicName}</p>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(extras.clinicAddress)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block text-sm text-brand underline-offset-2 hover:underline"
        >
          {extras.clinicAddress} →
        </a>
      </Card>

      {/* Languages */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
          Languages
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {extras.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand-dark"
            >
              {lang}
            </span>
          ))}
        </div>
      </Card>

      {/* Working hours */}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
          Working Hours
        </p>
        <ul className="mt-2 space-y-1.5">
          {extras.workingHours.map((row) => (
            <li key={row.day} className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground">{row.day}</span>
              <span className={`text-sm ${row.hours ? 'text-muted-foreground' : 'text-faint-foreground italic'}`}>
                {row.hours ?? 'Closed'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Reviews */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-faint-foreground">
            Reviews
          </p>
          <div className="flex items-center gap-1.5">
            <StarRating rating={extras.rating} />
            <span className="text-sm font-medium text-foreground">{extras.rating}</span>
          </div>
        </div>
        <ul className="mt-3 space-y-3">
          {extras.reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{review.authorName}</span>
                <StarRating rating={review.rating} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {review.comment}
              </p>
              <p className="mt-1 text-xs text-faint-foreground">
                {new Date(review.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
