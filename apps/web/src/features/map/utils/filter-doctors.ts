import type { MapDoctor, MapDoctorFilters } from '../types';
import { getDistanceKm } from './geo';

export function filterMapDoctors(
  doctors: MapDoctor[],
  userPosition: [number, number],
  filters: MapDoctorFilters
): MapDoctor[] {
  return doctors.filter((doctor) => {
    if (
      filters.selectedSpecialties.length > 0 &&
      !filters.selectedSpecialties.includes(doctor.specialty)
    ) {
      return false;
    }

    if (filters.availableTodayOnly && !doctor.availableToday) {
      return false;
    }

    const distanceKm = getDistanceKm(userPosition, doctor.position);
    return distanceKm <= filters.maxDistanceKm;
  });
}
