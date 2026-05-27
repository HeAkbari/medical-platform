'use client';

import { useMemo } from 'react';
import { MOCK_MAP_DOCTORS } from '../data/mock-doctors';
import { useMapFilterStore } from '../store/map-filter-store';
import { filterMapDoctors } from '../utils/filter-doctors';

export function useFilteredMapDoctors(userPosition: [number, number] | null) {
  const selectedSpecialties = useMapFilterStore(
    (state) => state.selectedSpecialties
  );
  const maxDistanceKm = useMapFilterStore((state) => state.maxDistanceKm);
  const availableTodayOnly = useMapFilterStore(
    (state) => state.availableTodayOnly
  );

  return useMemo(() => {
    if (!userPosition) {
      return [];
    }

    return filterMapDoctors(MOCK_MAP_DOCTORS, userPosition, {
      selectedSpecialties,
      maxDistanceKm,
      availableTodayOnly,
    });
  }, [
    availableTodayOnly,
    maxDistanceKm,
    selectedSpecialties,
    userPosition,
  ]);
}
