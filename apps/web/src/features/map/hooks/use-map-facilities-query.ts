'use client';

import { useQuery } from '@tanstack/react-query';
import type { MapFacility } from '../types';

async function fetchFacilities(): Promise<MapFacility[]> {
  const response = await fetch('/api/v1/facilities');
  if (!response.ok) {
    throw new Error('Failed to load facilities');
  }

  const json = (await response.json()) as { data: MapFacility[] };
  return json.data;
}

export function useMapFacilitiesQuery() {
  return useQuery({
    queryKey: ['map', 'facilities'],
    queryFn: fetchFacilities,
    staleTime: 60_000,
  });
}
