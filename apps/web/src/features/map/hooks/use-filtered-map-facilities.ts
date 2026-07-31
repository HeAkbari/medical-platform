'use client';

import { useMemo } from 'react';
import { useMapFilterStore } from '../store/map-filter-store';
import { filterMapFacilities } from '../utils/filter-facilities';
import { useMapFacilitiesQuery } from './use-map-facilities-query';

export function useFilteredMapFacilities(userPosition: [number, number] | null) {
  const { data: facilities } = useMapFacilitiesQuery();
  const selectedSuperCategories = useMapFilterStore(
    (state) => state.selectedSuperCategories
  );
  const maxDistanceKm = useMapFilterStore((state) => state.maxDistanceKm);
  const openNowOnly = useMapFilterStore((state) => state.openNowOnly);
  const is24HoursOnly = useMapFilterStore((state) => state.is24HoursOnly);
  const gender = useMapFilterStore((state) => state.gender);
  const language = useMapFilterStore((state) => state.language);
  const serviceOffering = useMapFilterStore((state) => state.serviceOffering);
  const registrationStatus = useMapFilterStore(
    (state) => state.registrationStatus
  );

  return useMemo(() => {
    if (!userPosition || !facilities) {
      return [];
    }

    return filterMapFacilities(facilities, userPosition, {
      selectedSuperCategories,
      maxDistanceKm,
      openNowOnly,
      is24HoursOnly,
      gender,
      language,
      serviceOffering,
      registrationStatus,
    });
  }, [
    facilities,
    gender,
    is24HoursOnly,
    language,
    maxDistanceKm,
    openNowOnly,
    registrationStatus,
    selectedSuperCategories,
    serviceOffering,
    userPosition,
  ]);
}
