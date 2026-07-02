'use client';

import Link from 'next/link';
import { usePatientsQuery } from '@/hooks';
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';

export function PatientsPage() {
  const { data, isLoading, isError } = usePatientsQuery();

  if (isLoading) {
    return <LoadingState label="Loading patients..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load patients." />;
  }

  const patients = data?.data ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader
          title="Patients"
          description="Mock patient records from the JSON-backed API."
        />
        {patients.length === 0 ? (
          <EmptyState title="No patients found" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {patients.map((patient) => (
              <li key={patient.id}>
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="flex min-h-[4.5rem] flex-col justify-center gap-1 py-3 active:bg-muted sm:py-4"
                >
                  <p className="font-medium text-brand">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {patient.email}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-faint-foreground sm:text-sm">
                    <span>{patient.phone}</span>
                    <span>DOB {patient.dateOfBirth}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
