'use client';

import { useQuery } from '@tanstack/react-query';
import type { LabResultDetail } from '../data/health-record-types';

async function fetchTestResultDetail(id: string): Promise<LabResultDetail> {
  const response = await fetch(`/api/v1/test-results/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load test result detail');
  }

  const json = (await response.json()) as { data: LabResultDetail };
  return json.data;
}

export function useTestResultDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['health-records', 'test-result', id],
    queryFn: () => fetchTestResultDetail(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
