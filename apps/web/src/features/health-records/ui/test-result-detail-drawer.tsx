'use client';

import { Drawer } from 'vaul';
import {
  Badge,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
} from '@/components/ui';
import { useTestResultDetailQuery } from '../hooks/use-test-result-detail-query';
import type { LabResultDetail } from '../data/health-record-types';

function statusVariant(status: string) {
  if (status === 'final' || status === 'amended' || status === 'corrected') {
    return 'success' as const;
  }
  if (status === 'cancelled' || status === 'entered-in-error') {
    return 'muted' as const;
  }
  return 'default' as const;
}

function formatDateTime(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
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

function DetailBody({ detail }: { detail: LabResultDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {detail.name}
          </h3>
          {detail.category ? (
            <p className="mt-0.5 text-sm text-faint-foreground capitalize">
              {detail.category}
            </p>
          ) : null}
        </div>
        <Badge variant={statusVariant(detail.status)}>{detail.status}</Badge>
      </div>

      {detail.values.length > 0 ? (
        <div className="rounded-xl border border-border p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Measurements
          </p>
          <div className="space-y-2">
            {detail.values.map((value, index) => (
              <div key={index}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {value.label ?? 'Value'}
                  </span>
                  <span className="font-semibold text-foreground">
                    {value.value}
                    {value.interpretation ? (
                      <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        {value.interpretation}
                      </span>
                    ) : null}
                  </span>
                </div>
                {value.referenceRange ? (
                  <p className="text-xs text-faint-foreground">
                    Reference: {value.referenceRange}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Field label="Taken" value={formatDateTime(detail.effectiveDate)} />
        <Field label="Reported" value={formatDateTime(detail.issued)} />
        <Field label="Performed by" value={detail.performer} />
        {detail.values.length === 0 ? (
          <Field label="Reference range" value={detail.referenceRange} />
        ) : null}
        <Field label="Interpretation" value={detail.interpretation} />
      </div>

      {detail.report ? (
        <div className="rounded-xl border border-brand-subtle/60 bg-brand-muted/40 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-dark">
            Diagnostic report
          </p>
          {detail.report.code ? (
            <p className="text-sm font-medium text-foreground">
              {detail.report.code}
            </p>
          ) : null}
          {detail.report.conclusion ? (
            <p className="mt-1 text-sm leading-6 text-accent-foreground">
              {detail.report.conclusion}
            </p>
          ) : null}
          {detail.report.performer ? (
            <p className="mt-2 text-xs text-faint-foreground">
              {detail.report.performer}
            </p>
          ) : null}
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

export function TestResultDetailDrawer({
  resultId,
  open,
  onOpenChange,
}: {
  resultId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useTestResultDetailQuery(
    open ? resultId : null
  );

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <div className="mx-auto w-full max-w-md">
        <Drawer.Title className="sr-only">
          {data?.name ?? 'Test result'}
        </Drawer.Title>
        {isLoading ? <LoadingState label="Loading result..." /> : null}
        {isError ? <ErrorState message="Could not load this result." /> : null}
        {data ? <DetailBody detail={data} /> : null}
      </div>
    </ResponsiveDrawer>
  );
}
