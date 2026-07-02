'use client';

import { Drawer } from 'vaul';
import {
  Badge,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
} from '@/components/ui';
import { useVaccinationDetailQuery } from '../hooks/use-vaccinations-query';
import type { VaccinationDetail } from '../data/clinical-record-types';

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-faint-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function DetailBody({ detail }: { detail: VaccinationDetail }) {
  const dose =
    detail.doseNumber !== undefined
      ? detail.seriesDoses !== undefined
        ? `Dose ${detail.doseNumber} of ${detail.seriesDoses}`
        : `Dose ${detail.doseNumber}`
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{detail.name}</h3>
          {dose ? <p className="mt-0.5 text-sm text-faint-foreground">{dose}</p> : null}
        </div>
        <Badge variant={detail.status === 'completed' ? 'success' : 'default'}>
          {detail.status}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <Field label="Date given" value={formatDate(detail.date)} />
        <Field label="Manufacturer" value={detail.manufacturer} />
        <Field label="Lot number" value={detail.lotNumber} />
        <Field label="Expiry" value={formatDate(detail.expirationDate)} />
        <Field label="Route" value={detail.route} />
        <Field label="Site" value={detail.site} />
        <Field label="Dose" value={detail.doseQuantity} />
        <Field label="Given by" value={detail.performer} />
      </div>

      {detail.targetDiseases.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Protects against
          </p>
          <div className="flex flex-wrap gap-1">
            {detail.targetDiseases.map((disease) => (
              <span
                key={disease}
                className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
              >
                {disease}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {detail.notes ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Notes
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{detail.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function VaccinationDetailDrawer({
  vaccinationId,
  open,
  onOpenChange,
}: {
  vaccinationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useVaccinationDetailQuery(
    open ? vaccinationId : null
  );

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <div className="mx-auto w-full max-w-md">
        <Drawer.Title className="sr-only">
          {data?.name ?? 'Vaccination'}
        </Drawer.Title>
        {isLoading ? <LoadingState label="Loading vaccination..." /> : null}
        {isError ? (
          <ErrorState message="Could not load this vaccination." />
        ) : null}
        {data ? <DetailBody detail={data} /> : null}
      </div>
    </ResponsiveDrawer>
  );
}
