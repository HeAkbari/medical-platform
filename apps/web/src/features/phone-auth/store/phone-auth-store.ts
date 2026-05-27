import { create } from 'zustand';
import type { MapDoctor } from '@/features/map/types';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';

export type PhoneAuthStep = 'phone' | 'otp' | 'register' | 'profile';

export type PendingAuthAction =
  | { type: 'appointment'; doctor: MapDoctor }
  | { type: 'profile' };

interface PhoneAuthStore {
  authOpen: boolean;
  step: PhoneAuthStep;
  phone: string;
  registrationToken: string | null;
  pendingAction: PendingAuthAction | null;
  openAuth: (options?: {
    step?: PhoneAuthStep;
    pendingAction?: PendingAuthAction | null;
  }) => void;
  setAuthOpen: (open: boolean) => void;
  setStep: (step: PhoneAuthStep) => void;
  setPhone: (phone: string) => void;
  setRegistrationToken: (token: string | null) => void;
  completePendingAction: () => void;
  resetFlow: () => void;
}

const initialState = {
  authOpen: false,
  step: 'phone' as PhoneAuthStep,
  phone: '',
  registrationToken: null,
  pendingAction: null as PendingAuthAction | null,
};

export const usePhoneAuthStore = create<PhoneAuthStore>((set, get) => ({
  ...initialState,
  openAuth: (options) =>
    set({
      authOpen: true,
      step: options?.step ?? 'phone',
      pendingAction:
        options?.pendingAction === undefined
          ? get().pendingAction
          : options.pendingAction,
    }),
  setAuthOpen: (open) =>
    set((state) => ({
      authOpen: open,
      ...(open
        ? {}
        : {
            step: 'phone',
            phone: '',
            registrationToken: null,
            pendingAction: null,
          }),
    })),
  setStep: (step) => set({ step }),
  setPhone: (phone) => set({ phone }),
  setRegistrationToken: (registrationToken) => set({ registrationToken }),
  completePendingAction: () => {
    const pendingAction = get().pendingAction;

    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === 'appointment') {
      useMapAppointmentStore.getState().openAppointment(pendingAction.doctor);
      set({ pendingAction: null, authOpen: false });
      return;
    }

    set({
      pendingAction: null,
      step: 'profile',
      authOpen: true,
    });
  },
  resetFlow: () =>
    set({
      step: 'phone',
      phone: '',
      registrationToken: null,
    }),
}));
