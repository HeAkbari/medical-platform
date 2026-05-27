import { create } from 'zustand';
import {
  DEFAULT_MAX_DISTANCE_KM,
  DOCTOR_SPECIALTIES,
  type MapNeedOptionId,
} from '../constants';
import type { DoctorSpecialty } from '../types';

interface MapFilterStore {
  selectedSpecialties: DoctorSpecialty[];
  maxDistanceKm: number;
  availableTodayOnly: boolean;
  toggleSpecialty: (specialty: DoctorSpecialty) => void;
  selectQuickNeed: (need: MapNeedOptionId) => void;
  setMaxDistanceKm: (km: number) => void;
  setAvailableTodayOnly: (value: boolean) => void;
  resetFilters: () => void;
}

const defaultState = {
  selectedSpecialties: [...DOCTOR_SPECIALTIES],
  maxDistanceKm: DEFAULT_MAX_DISTANCE_KM,
  availableTodayOnly: false,
};

export const useMapFilterStore = create<MapFilterStore>((set) => ({
  ...defaultState,
  toggleSpecialty: (specialty) =>
    set((state) => {
      const isSelected = state.selectedSpecialties.includes(specialty);

      return {
        selectedSpecialties: isSelected
          ? state.selectedSpecialties.filter((item) => item !== specialty)
          : [...state.selectedSpecialties, specialty],
      };
    }),
  selectQuickNeed: (need) =>
    set((state) => {
      if (need === 'all') {
        return { selectedSpecialties: [...DOCTOR_SPECIALTIES] };
      }

      const isOnlySelected =
        state.selectedSpecialties.length === 1 &&
        state.selectedSpecialties[0] === need;

      return {
        selectedSpecialties: isOnlySelected
          ? [...DOCTOR_SPECIALTIES]
          : [need],
      };
    }),
  setMaxDistanceKm: (km) => set({ maxDistanceKm: km }),
  setAvailableTodayOnly: (value) => set({ availableTodayOnly: value }),
  resetFilters: () => set(defaultState),
}));
