'use client';

import { useQuery } from '@tanstack/react-query';
import type {
  Vaccination,
  VaccinationDetail,
} from '../data/clinical-record-types';

async function fetchVaccinations(patientId?: string): Promise<Vaccination[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const response = await fetch(`/api/v1/vaccinations${query}`);
  if (!response.ok) {
    throw new Error('Failed to load vaccinations');
  }
  const json = (await response.json()) as { data: Vaccination[] };
  return json.data;
}

async function fetchVaccinationDetail(
  id: string
): Promise<VaccinationDetail> {
  const response = await fetch(`/api/v1/vaccinations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load vaccination detail');
  }
  const json = (await response.json()) as { data: VaccinationDetail };
  return json.data;
}

export function useVaccinationsQuery(patientId?: string) {
  return useQuery({
    queryKey: ['health-records', 'vaccinations', patientId ?? 'all'],
    queryFn: () => fetchVaccinations(patientId),
    staleTime: 60_000,
  });
}

export function useVaccinationDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['health-records', 'vaccination', id],
    queryFn: () => fetchVaccinationDetail(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
