'use client';

import { useQuery } from '@tanstack/react-query';
import type { Prescription } from '../data/health-record-types';

async function fetchPrescriptions(patientId?: string): Promise<Prescription[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const response = await fetch(`/api/v1/prescriptions${query}`);
  if (!response.ok) {
    throw new Error('Failed to load prescriptions');
  }

  const json = (await response.json()) as { data: Prescription[] };
  return json.data;
}

export function usePrescriptionsQuery(patientId?: string) {
  return useQuery({
    queryKey: ['health-records', 'prescriptions', patientId ?? 'all'],
    queryFn: () => fetchPrescriptions(patientId),
    staleTime: 60_000,
  });
}
