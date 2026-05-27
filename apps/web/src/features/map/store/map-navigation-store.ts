import { create } from 'zustand';
import { fetchMapRoute } from '../services/fetch-route';
import type {
  MapDoctor,
  MapNavigationStatus,
  MapRoute,
} from '../types';

interface MapNavigationStore {
  activeDoctor: MapDoctor | null;
  route: MapRoute | null;
  status: MapNavigationStatus;
  errorMessage: string | null;
  startNavigation: (
    doctor: MapDoctor,
    userPosition: [number, number]
  ) => Promise<void>;
  clearNavigation: () => void;
}

export const useMapNavigationStore = create<MapNavigationStore>((set) => ({
  activeDoctor: null,
  route: null,
  status: 'idle',
  errorMessage: null,
  startNavigation: async (doctor, userPosition) => {
    set({
      activeDoctor: doctor,
      route: null,
      status: 'loading',
      errorMessage: null,
    });

    try {
      const route = await fetchMapRoute(userPosition, doctor.position);

      set({
        activeDoctor: doctor,
        route,
        status: 'success',
        errorMessage: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to calculate route';

      set({
        activeDoctor: doctor,
        route: null,
        status: 'error',
        errorMessage: message,
      });
    }
  },
  clearNavigation: () =>
    set({
      activeDoctor: null,
      route: null,
      status: 'idle',
      errorMessage: null,
    }),
}));
