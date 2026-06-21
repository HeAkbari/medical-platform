'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  HealthRecordDetail,
  HealthRecordEntry,
  HealthRecordKind,
} from '../data/clinical-record-types';

async function fetchHealthRecords(
  patientId?: string
): Promise<HealthRecordEntry[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const response = await fetch(`/api/v1/health-records${query}`);
  if (!response.ok) {
    throw new Error('Failed to load health records');
  }
  const json = (await response.json()) as { data: HealthRecordEntry[] };
  return json.data;
}

async function fetchHealthRecordDetail(
  id: string,
  kind: HealthRecordKind
): Promise<HealthRecordDetail> {
  const response = await fetch(`/api/v1/health-records/${id}?kind=${kind}`);
  if (!response.ok) {
    throw new Error('Failed to load health record detail');
  }
  const json = (await response.json()) as { data: HealthRecordDetail };
  return json.data;
}

export function useHealthRecordsQuery(patientId?: string) {
  return useQuery({
    queryKey: ['health-records', 'conditions', patientId ?? 'all'],
    queryFn: () => fetchHealthRecords(patientId),
    staleTime: 60_000,
  });
}

export function useHealthRecordDetailQuery(
  id: string | null,
  kind: HealthRecordKind | null
) {
  return useQuery({
    queryKey: ['health-records', 'condition-detail', id, kind],
    queryFn: () => fetchHealthRecordDetail(id as string, kind as HealthRecordKind),
    enabled: Boolean(id) && Boolean(kind),
    staleTime: 60_000,
  });
}
