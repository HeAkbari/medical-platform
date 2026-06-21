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
import { useTestResultsQuery } from '../hooks/use-test-results-query';
import { TestResultDetailDrawer } from './test-result-detail-drawer';
import type { LabResult } from '../data/health-record-types';

function statusVariant(status: string) {
  if (status === 'final' || status === 'amended' || status === 'corrected') {
    return 'success' as const;
  }
  if (status === 'cancelled' || status === 'entered-in-error') {
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

function ResultCard({
  result,
  onSelect,
}: {
  result: LabResult;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{result.name}</p>
          {result.effectiveDate ? (
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(result.effectiveDate)}
            </p>
          ) : null}
        </div>
        <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
      </div>

      {result.values.length > 0 ? (
        <dl className="mt-3 space-y-1">
          {result.values.map((value, index) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <dt className="text-slate-500">{value.label ?? 'Value'}</dt>
              <dd className="font-medium text-slate-900">{value.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {result.referenceRange ? (
        <p className="mt-2 text-xs text-slate-500">
          Reference range: {result.referenceRange}
        </p>
      ) : null}
      {result.interpretation ? (
        <p className="mt-1 text-xs text-slate-600">
          Interpretation: {result.interpretation}
        </p>
      ) : null}
      {result.notes ? (
        <p className="mt-2 text-sm text-slate-600">{result.notes}</p>
      ) : null}
    </button>
  );
}

export function TestResultsPage() {
  const { data, isLoading, isError } = useTestResultsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading test results..." />;
  }
  if (isError) {
    return <ErrorState message="Could not load test results." />;
  }

  const results = data ?? [];

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
          title="Test results"
          description="View results from your GP or hospital tests."
        />
        {results.length === 0 ? (
          <EmptyState title="No test results found" />
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                onSelect={() => setSelectedId(result.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <TestResultDetailDrawer
        resultId={selectedId}
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
