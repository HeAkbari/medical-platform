import { create } from 'zustand';
import {
  DEFAULT_MAX_DISTANCE_KM,
  DOCTOR_SPECIALTIES,
} from '../constants';
import type { DoctorSpecialty } from '../types';

interface MapFilterStore {
  selectedSpecialties: DoctorSpecialty[];
  maxDistanceKm: number;
  availableTodayOnly: boolean;
  toggleSpecialty: (specialty: DoctorSpecialty) => void;
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
  setMaxDistanceKm: (km) => set({ maxDistanceKm: km }),
  setAvailableTodayOnly: (value) => set({ availableTodayOnly: value }),
  resetFilters: () => set(defaultState),
}));
