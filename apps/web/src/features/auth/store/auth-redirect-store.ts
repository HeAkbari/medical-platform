import { create } from 'zustand';
import type { MapFacility } from '@/features/map/types';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';

export type PendingAuthAction =
  | { type: 'appointment'; facility: MapFacility }
  | { type: 'book-appointment'; doctorId?: string; patientId?: string }
  | { type: 'profile' }
  | { type: 'navigate'; href: string };

interface AuthRedirectStore {
  pendingAction: PendingAuthAction | null;
  setPendingAction: (pendingAction: PendingAuthAction | null) => void;
  completePendingAction: () => void;
}

export const useAuthRedirectStore = create<AuthRedirectStore>((set, get) => ({
  pendingAction: null,
  setPendingAction: (pendingAction) => set({ pendingAction }),
  completePendingAction: () => {
    const pendingAction = get().pendingAction;

    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === 'appointment') {
      useMapAppointmentStore.getState().openAppointment(pendingAction.facility);
      set({ pendingAction: null });
      return;
    }

    set({ pendingAction: null });
  },
}));
