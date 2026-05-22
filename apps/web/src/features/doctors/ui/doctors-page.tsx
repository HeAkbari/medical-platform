'use client';

import { useDoctorsQuery } from '@/shared/hooks';
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/shared/ui';

export function DoctorsPage() {
  const { data, isLoading, isError } = useDoctorsQuery();

  if (isLoading) {
    return <LoadingState label="Loading doctors..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load doctors." />;
  }

  const doctors = data?.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Doctors"
          description="Doctors and specialists served from mock JSON data."
        />
        {doctors.length === 0 ? (
          <EmptyState title="No doctors found" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-semibold text-slate-900">
                  {doctor.firstName} {doctor.lastName}
                </p>
                <p className="mt-1 text-sm text-teal-700">{doctor.specialty}</p>
                <p className="mt-3 text-sm text-slate-600">{doctor.email}</p>
                <p className="text-sm text-slate-600">{doctor.phone}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
