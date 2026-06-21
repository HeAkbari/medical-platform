'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  DocumentDetail,
  DocumentRecord,
} from '../data/clinical-record-types';

async function fetchDocuments(patientId?: string): Promise<DocumentRecord[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const response = await fetch(`/api/v1/documents${query}`);
  if (!response.ok) {
    throw new Error('Failed to load documents');
  }
  const json = (await response.json()) as { data: DocumentRecord[] };
  return json.data;
}

async function fetchDocumentDetail(id: string): Promise<DocumentDetail> {
  const response = await fetch(`/api/v1/documents/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load document detail');
  }
  const json = (await response.json()) as { data: DocumentDetail };
  return json.data;
}

export function useDocumentsQuery(patientId?: string) {
  return useQuery({
    queryKey: ['health-records', 'documents', patientId ?? 'all'],
    queryFn: () => fetchDocuments(patientId),
    staleTime: 60_000,
  });
}

export function useDocumentDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['health-records', 'document', id],
    queryFn: () => fetchDocumentDetail(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
