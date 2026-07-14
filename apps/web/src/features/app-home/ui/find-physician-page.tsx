'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { cn } from '@/components/ui/cn';
import { PhysicianAvatar } from '@/features/doctors';
import { useDoctorsQuery } from '@/hooks';

export function FindPhysicianPage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const specialtyParam = (searchParams.get('specialty') ?? '').trim();
  const [activeSpecialty, setActiveSpecialty] = useState<string>(specialtyParam);

  const { data, isLoading, isError } = useDoctorsQuery();

  const specialties = useMemo(() => {
    const all = data?.data ?? [];
    return Array.from(new Set(all.map((d) => d.specialty))).sort();
  }, [data?.data]);

  const doctors = useMemo(() => {
    const all = data?.data ?? [];

    return all.filter((doctor) => {
      const matchesQuery = query
        ? [doctor.firstName, doctor.lastName, doctor.specialty]
            .join(' ')
            .toLowerCase()
            .includes(query)
        : true;

      const matchesSpecialty = activeSpecialty
        ? doctor.specialty === activeSpecialty
        : true;

      return matchesQuery && matchesSpecialty;
    });
  }, [data?.data, query, activeSpecialty]);

  if (isLoading) return <LoadingState label="Loading physicians..." />;
  if (isError) return <ErrorState message="Could not load physicians." />;

  return (
    <div className="space-y-4 pb-4">
      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Find Physician
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse physicians by specialty or search results.
        </p>
      </header>

      {/* Specialty filter chips */}
      {specialties.length > 0 ? (
        <div className="scrollbar-none -mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex w-max gap-2">
            <li>
              <button
                type="button"
                onClick={() => setActiveSpecialty('')}
                className={cn(
                  'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-medium transition active:scale-[0.98]',
                  !activeSpecialty
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-brand-subtle bg-card text-brand-dark hover:border-brand-light hover:bg-brand-muted'
                )}
              >
                All
              </button>
            </li>
            {specialties.map((specialty) => (
              <li key={specialty}>
                <button
                  type="button"
                  onClick={() =>
                    setActiveSpecialty((prev) =>
                      prev === specialty ? '' : specialty
                    )
                  }
                  className={cn(
                    'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm font-medium transition active:scale-[0.98]',
                    activeSpecialty === specialty
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-brand-subtle bg-card text-brand-dark hover:border-brand-light hover:bg-brand-muted'
                  )}
                >
                  {specialty}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {query ? (
        <p className="text-sm text-muted-foreground">
          Results for &ldquo;{searchParams.get('q')}&rdquo;
          {activeSpecialty ? ` · ${activeSpecialty}` : ''}
        </p>
      ) : null}

      {doctors.length === 0 ? (
        <EmptyState title="No physicians match your search" />
      ) : (
        <ul className="space-y-3">
          {doctors.map((doctor, index) => (
            <li key={doctor.id}>
              <Link
                href={`/physicians/${doctor.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
              >
                <PhysicianAvatar
                  firstName={doctor.firstName}
                  lastName={doctor.lastName}
                  doctorId={doctor.id}
                  size="lg"
                  shape="circle"
                  className="bg-brand-muted text-brand-dark"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-1.5">
                    <p className="font-semibold text-foreground">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    {index === 0 ? (
                      <Badge variant="warning">Sponsored</Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-brand">{doctor.specialty}</p>
                  <p className="mt-0.5 text-sm text-faint-foreground">
                    {doctor.phone}
                  </p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-4 w-4 shrink-0 text-faint-foreground"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
