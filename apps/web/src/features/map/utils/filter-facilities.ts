import { FACILITY_SUPER_CATEGORIES } from '../types';
import type { MapFacility, MapFacilityFilters } from '../types';
import { getDistanceKm } from './geo';
export function filterMapFacilities(
  facilities: MapFacility[],
  userPosition: [number, number],
  filters: MapFacilityFilters
): MapFacility[] {
  return facilities.filter((facility) => {
    if (
      filters.selectedSuperCategories.length > 0 &&
      filters.selectedSuperCategories.length < FACILITY_SUPER_CATEGORIES.length &&
      !filters.selectedSuperCategories.includes(facility.superCategory)
    ) {
      return false;
    }

    if (filters.openNowOnly && !facility.isOpenNow) {
      return false;
    }

    if (filters.is24HoursOnly && !facility.is24Hours && facility.hours !== '24/7') {
      return false;
    }

    if (
      filters.acceptingNewPatientsOnly &&
      facility.superCategory === 'primary-care' &&
      !facility.acceptingNewPatients
    ) {
      return false;
    }

    const distanceKm = getDistanceKm(userPosition, facility.position);
    return distanceKm <= filters.maxDistanceKm;
  });
}

export function formatFacilityAddress(facility: MapFacility): string {
  const { street, city, province, postalCode } = facility.address;
  return `${street}, ${city}, ${province} ${postalCode}`;
}

export function getFacilityCategoryLabel(facility: MapFacility): string {
  return facility.subcategory ?? facility.category;
}

export function formatWaitTimeUpdatedAt(isoDate: string): string {
  const updated = new Date(isoDate);
  const now = new Date();
  const diffMinutes = Math.max(
    0,
    Math.round((now.getTime() - updated.getTime()) / 60_000)
  );

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} hr ago`;
}
