'use client';

import Link from 'next/link';
import { useDashboardBasePath } from '@/hooks/use-dashboard-base-path';
import {
  useAppointmentsQuery,
  useDoctorsQuery,
  usePatientsQuery,
} from '@/hooks';
import { Badge, Card, ErrorState, LoadingState } from '@/components/ui';

export function DashboardOverviewPage() {
  const basePath = useDashboardBasePath();
  const patientsQuery = usePatientsQuery();
  const doctorsQuery = useDoctorsQuery();
  const appointmentsQuery = useAppointmentsQuery();

  const isLoading =
    patientsQuery.isLoading ||
    doctorsQuery.isLoading ||
    appointmentsQuery.isLoading;

  const isError =
    patientsQuery.isError ||
    doctorsQuery.isError ||
    appointmentsQuery.isError;

  if (isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (isError) {
    return <ErrorState message="Could not load dashboard data from mock API." />;
  }

  const scheduledCount =
    appointmentsQuery.data?.data.filter((item) => item.status === 'scheduled')
      .length ?? 0;

  const stats = [
    {
      label: 'Patients',
      value: patientsQuery.data?.total ?? 0,
      href: `${basePath}/patients`,
    },
    {
      label: 'Doctors',
      value: doctorsQuery.data?.total ?? 0,
      href: `${basePath}/doctors`,
    },
    {
      label: 'Appointments',
      value: appointmentsQuery.data?.total ?? 0,
      href: `${basePath}/appointments`,
    },
    {
      label: 'Scheduled',
      value: scheduledCount,
      href: `${basePath}/appointments`,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-1.5">
        <Badge>Frontend MVP</Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Clinic dashboard
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          UI-first MVP powered by mock JSON APIs.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="active:scale-[0.98]">
            <Card className="h-full transition hover:border-teal-200 hover:shadow-md">
              <p className="text-xs text-slate-500 sm:text-sm">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 sm:mt-2 sm:text-3xl">
                {stat.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Quick actions
        </h2>
        <div className="mt-3 grid gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:gap-3">
          <Link
            href={`${basePath}/appointments/new`}
            className="flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white active:bg-teal-900 sm:inline-flex sm:w-auto"
          >
            Book appointment
          </Link>
          <Link
            href={`${basePath}/patients`}
            className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 active:bg-slate-50 sm:inline-flex sm:w-auto"
          >
            View patients
          </Link>
        </div>
      </Card>
    </div>
  );
}
