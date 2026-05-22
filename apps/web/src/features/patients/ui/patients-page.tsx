'use client';

import Link from 'next/link';
import { useDashboardBasePath } from '@/hooks/use-dashboard-base-path';
import { usePatientsQuery } from '@/hooks';
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';

export function PatientsPage() {
  const basePath = useDashboardBasePath();
  const { data, isLoading, isError } = usePatientsQuery();

  if (isLoading) {
    return <LoadingState label="Loading patients..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load patients." />;
  }

  const patients = data?.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Patients"
          description="Mock patient records from the JSON-backed API."
        />
        {patients.length === 0 ? (
          <EmptyState title="No patients found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Phone</th>
                  <th className="px-3 py-3 font-medium">Date of birth</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`${basePath}/patients/${patient.id}`}
                        className="font-medium text-teal-700 hover:underline"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{patient.email}</td>
                    <td className="px-3 py-3 text-slate-600">{patient.phone}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {patient.dateOfBirth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
