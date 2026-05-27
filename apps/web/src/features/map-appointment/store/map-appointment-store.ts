import { create } from 'zustand';
import type { MapDoctor } from '@/features/map/types';

interface MapAppointmentStore {
  appointmentOpen: boolean;
  selectedDoctor: MapDoctor | null;
  openAppointment: (doctor: MapDoctor) => void;
  setAppointmentOpen: (open: boolean) => void;
}

export const useMapAppointmentStore = create<MapAppointmentStore>((set) => ({
  appointmentOpen: false,
  selectedDoctor: null,
  openAppointment: (doctor) =>
    set({
      selectedDoctor: doctor,
      appointmentOpen: true,
    }),
  setAppointmentOpen: (open) =>
    set((state) => ({
      appointmentOpen: open,
      selectedDoctor: open ? state.selectedDoctor : null,
    })),
}));
