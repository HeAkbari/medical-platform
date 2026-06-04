import Link from 'next/link';
import { Badge, Button, Card, CardHeader } from '@/components/ui';
import { MOCK_VACCINATIONS } from '@/features/app-home/data/mock-patient-services';
import type {
  MockVaccination,
  VaccinationStatus,
} from '@/features/app-home/types/patient-services';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';
import { formatServiceDate } from '@/features/app-home/utils/service-formatters';

function vaccinationStatusVariant(
  status: VaccinationStatus
): 'default' | 'success' | 'warning' | 'muted' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'scheduled':
      return 'default';
    case 'due':
      return 'warning';
    case 'overdue':
      return 'muted';
  }
}

function vaccinationStatusLabel(status: VaccinationStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'due':
      return 'Due soon';
    case 'overdue':
      return 'Overdue';
    case 'scheduled':
      return 'Eligible / book';
  }
}

function VaccinationRow({ vaccination }: { vaccination: MockVaccination }) {
  const showBook =
    vaccination.status === 'due' ||
    vaccination.status === 'scheduled' ||
    vaccination.status === 'overdue';

  return (
    <article className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{vaccination.vaccine}</p>
          {vaccination.doseLabel ? (
            <p className="mt-0.5 text-sm text-slate-500">
              {vaccination.doseLabel}
            </p>
          ) : null}
        </div>
        <Badge variant={vaccinationStatusVariant(vaccination.status)}>
          {vaccinationStatusLabel(vaccination.status)}
        </Badge>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-slate-500">Provider</dt>
          <dd>{vaccination.provider}</dd>
        </div>
        {vaccination.date ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">Date given</dt>
            <dd>{formatServiceDate(vaccination.date)}</dd>
          </div>
        ) : null}
        {vaccination.dueDate ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">
              {vaccination.status === 'completed' ? 'Next due' : 'Due date'}
            </dt>
            <dd>{formatServiceDate(vaccination.dueDate)}</dd>
          </div>
        ) : null}
      </dl>

      {showBook ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href="/home/map" className="inline-flex flex-1">
            <Button variant="secondary" fullWidth>
              Find clinic on map
            </Button>
          </Link>
          <Button type="button" fullWidth disabled>
            Book vaccination
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function VaccinationsServicePage() {
  const dueCount = MOCK_VACCINATIONS.filter(
    (item) =>
      item.status === 'due' ||
      item.status === 'scheduled' ||
      item.status === 'overdue'
  ).length;

  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Vaccinations"
          description="See vaccination history and book new vaccines."
          action={
            dueCount > 0 ? (
              <p className="text-sm text-slate-500">{dueCount} to schedule</p>
            ) : undefined
          }
        />

        <div className="space-y-3">
          {MOCK_VACCINATIONS.map((vaccination) => (
            <VaccinationRow key={vaccination.id} vaccination={vaccination} />
          ))}
        </div>
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
