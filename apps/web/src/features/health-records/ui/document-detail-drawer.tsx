'use client';

import { Drawer } from 'vaul';
import {
  Badge,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
} from '@/components/ui';
import { useDocumentDetailQuery } from '../hooks/use-documents-query';
import type { DocumentDetail } from '../data/clinical-record-types';

function formatDate(value?: string): string {
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
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function DetailBody({ detail }: { detail: DocumentDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {detail.type ?? detail.title}
          </h3>
          {detail.category ? (
            <p className="mt-0.5 text-sm text-slate-500">{detail.category}</p>
          ) : null}
        </div>
        {detail.docStatus ? (
          <Badge variant="muted">{detail.docStatus}</Badge>
        ) : null}
      </div>

      {detail.description ? (
        <p className="text-sm leading-6 text-slate-600">{detail.description}</p>
      ) : null}

      <div className="space-y-1.5">
        <Field label="Date" value={formatDate(detail.date)} />
        <Field label="Author" value={detail.author} />
        <Field label="Custodian" value={detail.custodian} />
      </div>

      {detail.fileTitle ? (
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Attached file
          </p>
          <div className="flex items-center gap-3">
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
              <p className="truncate text-sm font-medium text-slate-900">
                {detail.fileTitle}
              </p>
              <p className="text-xs text-slate-500">
                {[detail.contentType, detail.fileSize]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Document preview is not available in the sandbox.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function DocumentDetailDrawer({
  documentId,
  open,
  onOpenChange,
}: {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useDocumentDetailQuery(
    open ? documentId : null
  );

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <div className="mx-auto w-full max-w-md">
        <Drawer.Title className="sr-only">
          {data?.title ?? 'Document'}
        </Drawer.Title>
        {isLoading ? <LoadingState label="Loading document..." /> : null}
        {isError ? <ErrorState message="Could not load this document." /> : null}
        {data ? <DetailBody detail={data} /> : null}
      </div>
    </ResponsiveDrawer>
  );
}
