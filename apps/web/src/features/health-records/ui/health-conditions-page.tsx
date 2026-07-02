'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { useHealthRecordsQuery } from '../hooks/use-health-records-query';
import { HealthRecordDetailDrawer } from './health-record-detail-drawer';
import type {
  HealthRecordEntry,
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

function RecordCard({
  record,
  onSelect,
}: {
  record: HealthRecordEntry;
  onSelect: () => void;
}) {
  const isAllergy = record.kind === 'allergy';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-border p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              isAllergy
                ? 'bg-red-100 text-red-800'
                : 'bg-brand-muted text-brand-dark'
            }`}
          >
            {isAllergy ? 'Allergy' : 'Condition'}
          </span>
          <p className="mt-1.5 font-medium text-foreground">{record.name}</p>
          <p className="mt-0.5 text-sm text-faint-foreground">
            {[record.clinicalStatus, formatDate(record.recordedDate)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        {record.tag ? (
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
            {record.tag}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function HealthConditionsPage() {
  const { data, isLoading, isError } = useHealthRecordsQuery();
  const [selected, setSelected] = useState<{
    id: string;
    kind: HealthRecordKind;
  } | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading health record..." />;
  }
  if (isError) {
    return <ErrorState message="Could not load your health record." />;
  }

  const records = data ?? [];

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
          title="Health conditions"
          description="Conditions, allergies, and medicine reactions on record."
        />
        {records.length === 0 ? (
          <EmptyState title="No conditions or allergies found" />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <RecordCard
                key={`${record.kind}-${record.id}`}
                record={record}
                onSelect={() =>
                  setSelected({ id: record.id, kind: record.kind })
                }
              />
            ))}
          </div>
        )}
      </Card>

      <HealthRecordDetailDrawer
        recordId={selected?.id ?? null}
        kind={selected?.kind ?? null}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      />
    </div>
  );
}
