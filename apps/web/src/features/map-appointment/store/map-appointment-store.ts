import { create } from 'zustand';
import type { MapFacility } from '@/features/map/types';

interface MapAppointmentStore {
  appointmentOpen: boolean;
  selectedFacility: MapFacility | null;
  openAppointment: (facility: MapFacility) => void;
  setAppointmentOpen: (open: boolean) => void;
}

export const useMapAppointmentStore = create<MapAppointmentStore>((set) => ({
  appointmentOpen: false,
  selectedFacility: null,
  openAppointment: (facility) =>
    set({
      selectedFacility: facility,
      appointmentOpen: true,
    }),
  setAppointmentOpen: (open) =>
    set((state) => ({
      appointmentOpen: open,
      selectedFacility: open ? state.selectedFacility : null,
    })),
}));
