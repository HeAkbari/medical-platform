'use client';

import { useMemo } from 'react';
import { MOCK_MAP_FACILITIES } from '../data/mock-facilities';
import { useMapFilterStore } from '../store/map-filter-store';
import { filterMapFacilities } from '../utils/filter-facilities';

export function useFilteredMapFacilities(userPosition: [number, number] | null) {
  const selectedSuperCategories = useMapFilterStore(
    (state) => state.selectedSuperCategories
  );
  const maxDistanceKm = useMapFilterStore((state) => state.maxDistanceKm);
  const openNowOnly = useMapFilterStore((state) => state.openNowOnly);
  const is24HoursOnly = useMapFilterStore((state) => state.is24HoursOnly);
  const acceptingNewPatientsOnly = useMapFilterStore(
    (state) => state.acceptingNewPatientsOnly
  );

  return useMemo(() => {
    if (!userPosition) {
      return [];
    }

    return filterMapFacilities(MOCK_MAP_FACILITIES, userPosition, {
      selectedSuperCategories,
      maxDistanceKm,
      openNowOnly,
      is24HoursOnly,
      acceptingNewPatientsOnly,
    });
  }, [
    acceptingNewPatientsOnly,
    is24HoursOnly,
    maxDistanceKm,
    openNowOnly,
    selectedSuperCategories,
    userPosition,
  ]);
}
