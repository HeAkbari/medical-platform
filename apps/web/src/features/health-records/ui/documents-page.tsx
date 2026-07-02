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
import { useDocumentsQuery } from '../hooks/use-documents-query';
import { DocumentDetailDrawer } from './document-detail-drawer';
import type { DocumentRecord } from '../data/clinical-record-types';

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

function DocumentCard({
  document,
  onSelect,
}: {
  document: DocumentRecord;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99] sm:p-4"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M8 4h6l4 4v12H6V4z" />
          <path d="M14 4v4h4" strokeLinecap="round" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {document.type ?? document.title}
        </p>
        <p className="mt-0.5 text-sm text-faint-foreground">
          {formatDate(document.date)}
        </p>
      </div>
    </button>
  );
}

export function DocumentsPage() {
  const { data, isLoading, isError } = useDocumentsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState label="Loading documents..." />;
  }
  if (isError) {
    return <ErrorState message="Could not load documents." />;
  }

  const documents = data ?? [];

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
          title="Documents"
          description="Letters and documents from your GP or hospital."
        />
        {documents.length === 0 ? (
          <EmptyState title="No documents found" />
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onSelect={() => setSelectedId(document.id)}
              />
            ))}
          </div>
        )}
      </Card>

      <DocumentDetailDrawer
        documentId={selectedId}
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
