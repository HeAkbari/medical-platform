'use client';

import { useQuery } from '@tanstack/react-query';
import type { PrescriptionDetail } from '../data/health-record-types';

async function fetchPrescriptionDetail(
  id: string
): Promise<PrescriptionDetail> {
  const response = await fetch(`/api/v1/prescriptions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load prescription detail');
  }

  const json = (await response.json()) as { data: PrescriptionDetail };
  return json.data;
}

export function usePrescriptionDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['health-records', 'prescription', id],
    queryFn: () => fetchPrescriptionDetail(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
