'use client';

import Link from 'next/link';
import { DASHBOARD_BASE_PATH } from '@/config';
import {
  useAppointmentsQuery,
  useDoctorsQuery,
  usePatientsQuery,
} from '@/shared/hooks';
import { Badge, Card, ErrorState, LoadingState } from '@/shared/ui';

export function DashboardOverviewPage() {
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
      href: `${DASHBOARD_BASE_PATH}/patients`,
    },
    {
      label: 'Doctors',
      value: doctorsQuery.data?.total ?? 0,
      href: `${DASHBOARD_BASE_PATH}/doctors`,
    },
    {
      label: 'Appointments',
      value: appointmentsQuery.data?.total ?? 0,
      href: `${DASHBOARD_BASE_PATH}/appointments`,
    },
    {
      label: 'Scheduled',
      value: scheduledCount,
      href: `${DASHBOARD_BASE_PATH}/appointments`,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge>Frontend MVP</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Clinic dashboard
        </h1>
        <p className="max-w-2xl text-slate-600">
          UI-first MVP powered by mock JSON APIs. Replace the data layer later
          without changing these screens.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition hover:border-teal-200 hover:shadow-md">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`${DASHBOARD_BASE_PATH}/appointments/new`}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Book appointment
          </Link>
          <Link
            href={`${DASHBOARD_BASE_PATH}/patients`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View patients
          </Link>
        </div>
      </Card>
    </div>
  );
}
