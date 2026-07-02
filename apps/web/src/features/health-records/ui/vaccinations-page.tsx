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
import { useVaccinationsQuery } from '../hooks/use-vaccinations-query';
import { VaccinationDetailDrawer } from './vaccination-detail-drawer';
import type { Vaccination } from '../data/clinical-record-types';

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

function VaccinationCard({
  vaccination,
  onSelect,
}: {
  vaccination: Vaccination;
  onSelect: () => void;
}) {
  const dose =
    vaccination.doseNumber !== undefined
      ? vaccination.seriesDoses !== undefined
        ? `Dose ${vaccination.doseNumber} of ${vaccination.seriesDoses}`
        : `Dose ${vaccination.doseNumber}`
      : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-border p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{vaccination.name}</p>
          <p className="mt-1 text-sm text-faint-foreground">
            {formatDate(vaccination.date)}
            {dose ? ` · ${dose}` : ''}
          </p>
        </div>
        <Badge
          variant={vaccination.status === 'completed' ? 'success' : 'default'}
        >
          {vaccination.status}
        </Badge>
      </div>
    </button>
  );
}

export function VaccinationsPage() {
  const { data, isLoading, isError } = useVaccinationsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading vaccinations..." />;
  }
  if (isError) {
    return <ErrorState message="Could not load vaccinations." />;
  }

  const vaccinations = data ?? [];

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
          title="Vaccinations"
          description="Your vaccination history on record."
        />
        {vaccinations.length === 0 ? (
          <EmptyState title="No vaccinations found" />
        ) : (
          <div className="space-y-3">
            {vaccinations.map((vaccination) => (
              <VaccinationCard
                key={vaccination.id}
                vaccination={vaccination}
                onSelect={() => setSelectedId(vaccination.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <VaccinationDetailDrawer
        vaccinationId={selectedId}
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
