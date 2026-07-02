'use client';

import { Drawer } from 'vaul';
import {
  Badge,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
} from '@/components/ui';
import { useHealthRecordDetailQuery } from '../hooks/use-health-records-query';
import type {
  AllergyDetail,
  ConditionDetail,
  HealthRecordDetail,
  HealthRecordKind,
} from '../data/clinical-record-types';

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

function Notes({ notes }: { notes?: string }) {
  if (!notes) {
    return null;
  }
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
        Notes
      </p>
      <p className="text-sm leading-6 text-muted-foreground">{notes}</p>
    </div>
  );
}

function ConditionBody({ detail }: { detail: ConditionDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Condition
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-foreground">
            {detail.name}
          </h3>
        </div>
        {detail.clinicalStatus ? (
          <Badge
            variant={
              detail.clinicalStatus.toLowerCase() === 'active'
                ? 'default'
                : 'muted'
            }
          >
            {detail.clinicalStatus}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Field label="Verification" value={detail.verificationStatus} />
        <Field label="Category" value={detail.category} />
        <Field label="Severity" value={detail.severity} />
        <Field label="Onset" value={formatDate(detail.onsetDate)} />
        <Field label="Recorded" value={formatDate(detail.recordedDate)} />
      </div>

      <Notes notes={detail.notes} />
    </div>
  );
}

function AllergyBody({ detail }: { detail: AllergyDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Allergy
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-foreground">
            {detail.name}
          </h3>
        </div>
        {detail.criticality ? (
          <Badge variant={detail.criticality === 'high' ? 'default' : 'muted'}>
            {detail.criticality} risk
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Field label="Type" value={detail.type} />
        <Field
          label="Category"
          value={detail.categories.join(', ') || undefined}
        />
        <Field label="Status" value={detail.clinicalStatus} />
        <Field label="Verification" value={detail.verificationStatus} />
        <Field label="Onset" value={formatDate(detail.onsetDate)} />
        <Field label="Recorded" value={formatDate(detail.recordedDate)} />
      </div>

      {detail.reactions.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Reactions
          </p>
          <div className="space-y-2">
            {detail.reactions.map((reaction, index) => (
              <div
                key={index}
                className="rounded-lg border border-red-100 bg-error-subtle/60 p-2.5"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {reaction.manifestations.map((manifestation) => (
                    <span
                      key={manifestation}
                      className="inline-flex rounded-full bg-card px-2 py-0.5 text-xs font-medium text-red-800"
                    >
                      {manifestation}
                    </span>
                  ))}
                  {reaction.severity ? (
                    <span className="text-xs text-error-foreground">
                      · {reaction.severity}
                    </span>
                  ) : null}
                </div>
                {reaction.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reaction.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Notes notes={detail.notes} />
    </div>
  );
}

function DetailBody({ detail }: { detail: HealthRecordDetail }) {
  return detail.kind === 'allergy' ? (
    <AllergyBody detail={detail} />
  ) : (
    <ConditionBody detail={detail} />
  );
}

export function HealthRecordDetailDrawer({
  recordId,
  kind,
  open,
  onOpenChange,
}: {
  recordId: string | null;
  kind: HealthRecordKind | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useHealthRecordDetailQuery(
    open ? recordId : null,
    open ? kind : null
  );

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <div className="mx-auto w-full max-w-md">
        <Drawer.Title className="sr-only">
          {data?.name ?? 'Health record'}
        </Drawer.Title>
        {isLoading ? <LoadingState label="Loading record..." /> : null}
        {isError ? <ErrorState message="Could not load this record." /> : null}
        {data ? <DetailBody detail={data} /> : null}
      </div>
    </ResponsiveDrawer>
  );
}
