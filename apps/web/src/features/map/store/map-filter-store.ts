import { create } from 'zustand';
import {
  DEFAULT_MAX_DISTANCE_KM,
  type MapCategoryOptionId,
} from '../constants';
import {
  FACILITY_SUPER_CATEGORIES,
  type FacilityGender,
  type FacilityServiceOffering,
  type FacilitySuperCategory,
} from '../types';

interface MapFilterStore {
  selectedSuperCategories: FacilitySuperCategory[];
  maxDistanceKm: number;
  openNowOnly: boolean;
  is24HoursOnly: boolean;
  gender: 'all' | FacilityGender;
  language: 'all' | string;
  serviceOffering: 'all' | FacilityServiceOffering;
  registrationStatus: 'all' | 'yes' | 'no';
  toggleSuperCategory: (category: FacilitySuperCategory) => void;
  selectQuickCategory: (category: MapCategoryOptionId) => void;
  setMaxDistanceKm: (km: number) => void;
  setOpenNowOnly: (value: boolean) => void;
  setIs24HoursOnly: (value: boolean) => void;
  setGender: (value: 'all' | FacilityGender) => void;
  setLanguage: (value: 'all' | string) => void;
  setServiceOffering: (value: 'all' | FacilityServiceOffering) => void;
  setRegistrationStatus: (value: 'all' | 'yes' | 'no') => void;
  resetFilters: () => void;
}

const defaultState = {
  selectedSuperCategories: [...FACILITY_SUPER_CATEGORIES],
  maxDistanceKm: DEFAULT_MAX_DISTANCE_KM,
  openNowOnly: false,
  is24HoursOnly: false,
  gender: 'all' as const,
  language: 'all' as const,
  serviceOffering: 'all' as const,
  registrationStatus: 'all' as const,
};

export const useMapFilterStore = create<MapFilterStore>((set) => ({
  ...defaultState,
  toggleSuperCategory: (category) =>
    set((state) => {
      const isSelected = state.selectedSuperCategories.includes(category);

      return {
        selectedSuperCategories: isSelected
          ? state.selectedSuperCategories.filter((item) => item !== category)
          : [...state.selectedSuperCategories, category],
      };
    }),
  selectQuickCategory: (category) =>
    set((state) => {
      if (category === 'all') {
        return { selectedSuperCategories: [...FACILITY_SUPER_CATEGORIES] };
      }

      const superCategory = category as FacilitySuperCategory;
      const isOnlySelected =
        state.selectedSuperCategories.length === 1 &&
        state.selectedSuperCategories[0] === superCategory;

      return {
        selectedSuperCategories: isOnlySelected
          ? [...FACILITY_SUPER_CATEGORIES]
          : [superCategory],
      };
    }),
  setMaxDistanceKm: (km) => set({ maxDistanceKm: km }),
  setOpenNowOnly: (value) => set({ openNowOnly: value }),
  setIs24HoursOnly: (value) => set({ is24HoursOnly: value }),
  setGender: (value) => set({ gender: value }),
  setLanguage: (value) => set({ language: value }),
  setServiceOffering: (value) => set({ serviceOffering: value }),
  setRegistrationStatus: (value) => set({ registrationStatus: value }),
  resetFilters: () => set(defaultState),
}));
