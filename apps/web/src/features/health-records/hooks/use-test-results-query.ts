'use client';

import { useQuery } from '@tanstack/react-query';
import type { LabResult } from '../data/health-record-types';

async function fetchTestResults(patientId?: string): Promise<LabResult[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const response = await fetch(`/api/v1/test-results${query}`);
  if (!response.ok) {
    throw new Error('Failed to load test results');
  }

  const json = (await response.json()) as { data: LabResult[] };
  return json.data;
}

export function useTestResultsQuery(patientId?: string) {
  return useQuery({
    queryKey: ['health-records', 'test-results', patientId ?? 'all'],
    queryFn: () => fetchTestResults(patientId),
    staleTime: 60_000,
  });
}
