import { create } from 'zustand';
import { fetchMapRoute } from '../services/fetch-route';
import type {
  MapFacility,
  MapNavigationStatus,
  MapRoute,
} from '../types';

interface MapNavigationStore {
  activeFacility: MapFacility | null;
  route: MapRoute | null;
  status: MapNavigationStatus;
  errorMessage: string | null;
  startNavigation: (
    facility: MapFacility,
    userPosition: [number, number]
  ) => Promise<void>;
  clearNavigation: () => void;
}

export const useMapNavigationStore = create<MapNavigationStore>((set) => ({
  activeFacility: null,
  route: null,
  status: 'idle',
  errorMessage: null,
  startNavigation: async (facility, userPosition) => {
    set({
      activeFacility: facility,
      route: null,
      status: 'loading',
      errorMessage: null,
    });

    try {
      const route = await fetchMapRoute(userPosition, facility.position);

      set({
        activeFacility: facility,
        route,
        status: 'success',
        errorMessage: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to calculate route';

      set({
        activeFacility: facility,
        route: null,
        status: 'error',
        errorMessage: message,
      });
    }
  },
  clearNavigation: () =>
    set({
      activeFacility: null,
      route: null,
      status: 'idle',
      errorMessage: null,
    }),
}));
