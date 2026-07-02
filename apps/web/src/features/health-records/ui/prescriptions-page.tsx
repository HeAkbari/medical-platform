'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui';
import { usePrescriptionsQuery } from '../hooks/use-prescriptions-query';
import { PrescriptionDetailDrawer } from './prescription-detail-drawer';
import type { Prescription } from '../data/health-record-types';

function statusVariant(status: string) {
  if (status === 'active') {
    return 'success' as const;
  }
  if (
    status === 'cancelled' ||
    status === 'stopped' ||
    status === 'completed' ||
    status === 'entered-in-error'
  ) {
    return 'muted' as const;
  }
  return 'default' as const;
}

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

function PrescriptionCard({
  prescription,
  onSelect,
}: {
  prescription: Prescription;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-border p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{prescription.medication}</p>
          {prescription.authoredOn ? (
            <p className="mt-1 text-sm text-faint-foreground">
              Prescribed {formatDate(prescription.authoredOn)}
            </p>
          ) : null}
        </div>
        <Badge variant={statusVariant(prescription.status)}>
          {prescription.status}
        </Badge>
      </div>

      {prescription.dosageInstructions.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-accent-foreground">
          {prescription.dosageInstructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      ) : null}

      {prescription.repeatsAllowed !== undefined ? (
        <p className="mt-2 text-xs text-faint-foreground">
          Repeats allowed: {prescription.repeatsAllowed}
        </p>
      ) : null}
    </button>
  );
}

export function PrescriptionsPage() {
  const { data, isLoading, isError } = usePrescriptionsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading prescriptions..." />;
  }
  if (isError) {
    return <ErrorState message="Could not load prescriptions." />;
  }

  const prescriptions = data ?? [];

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
          title="Prescriptions"
          description="Your repeat prescriptions and medications on record."
        />
        {prescriptions.length === 0 ? (
          <EmptyState title="No prescriptions found" />
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onSelect={() => setSelectedId(prescription.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <PrescriptionDetailDrawer
        prescriptionId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      />
    </div>
  );
}
