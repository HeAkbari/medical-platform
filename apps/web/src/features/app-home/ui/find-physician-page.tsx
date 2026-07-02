'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useDoctorsQuery } from '@/hooks';

export function FindPhysicianPage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();
  const { data, isLoading, isError } = useDoctorsQuery();

  const doctors = useMemo(() => {
    const all = data?.data ?? [];

    if (!query) {
      return all;
    }

    return all.filter((doctor) => {
      const haystack = [
        doctor.firstName,
        doctor.lastName,
        doctor.specialty,
        doctor.email,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data?.data, query]);

  if (isLoading) {
    return <LoadingState label="Loading physicians..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load physicians." />;
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

      <Card>
        <CardHeader
          title="Find physician"
          description="Browse physicians ordered by regional relevance and sponsored placement. Full search integration arrives in a later phase."
        />

        {query ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing results for &ldquo;{searchParams.get('q')}&rdquo;
          </p>
        ) : null}

        {doctors.length === 0 ? (
          <EmptyState title="No physicians match your search" />
        ) : (
          <ul className="space-y-3">
            {doctors.map((doctor, index) => (
              <li
                key={doctor.id}
                className="rounded-xl border border-border bg-card p-4 border-border bg-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    <p className="mt-1 text-sm text-brand">{doctor.specialty}</p>
                  </div>
                  {index === 0 ? (
                    <Badge variant="warning">Sponsored</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {doctor.phone}
                </p>
                <p className="text-sm text-faint-foreground">
                  {doctor.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
