'use client';

import { useQuery } from '@tanstack/react-query';
import type { FacilityDetail } from '../data/facility-detail';

async function fetchFacilityDetail(id: string): Promise<FacilityDetail> {
  const response = await fetch(`/api/v1/facilities/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load facility detail');
  }

  const json = (await response.json()) as { data: FacilityDetail };
  return json.data;
}

export function useFacilityDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: ['map', 'facility', id],
    queryFn: () => fetchFacilityDetail(id),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
  });
}
