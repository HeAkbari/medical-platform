import { create } from 'zustand';
import {
  DEFAULT_MAX_DISTANCE_KM,
  type MapCategoryOptionId,
} from '../constants';
import {
  FACILITY_SUPER_CATEGORIES,
  type FacilitySuperCategory,
} from '../types';

interface MapFilterStore {
  selectedSuperCategories: FacilitySuperCategory[];
  maxDistanceKm: number;
  openNowOnly: boolean;
  is24HoursOnly: boolean;
  acceptingNewPatientsOnly: boolean;
  toggleSuperCategory: (category: FacilitySuperCategory) => void;
  selectQuickCategory: (category: MapCategoryOptionId) => void;
  setMaxDistanceKm: (km: number) => void;
  setOpenNowOnly: (value: boolean) => void;
  setIs24HoursOnly: (value: boolean) => void;
  setAcceptingNewPatientsOnly: (value: boolean) => void;
  resetFilters: () => void;
}

const defaultState = {
  selectedSuperCategories: [...FACILITY_SUPER_CATEGORIES],
  maxDistanceKm: DEFAULT_MAX_DISTANCE_KM,
  openNowOnly: false,
  is24HoursOnly: false,
  acceptingNewPatientsOnly: false,
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
  setAcceptingNewPatientsOnly: (value) =>
    set({ acceptingNewPatientsOnly: value }),
  resetFilters: () => set(defaultState),
}));
