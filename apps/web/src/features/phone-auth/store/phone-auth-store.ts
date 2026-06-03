import { create } from 'zustand';
import type { MapDoctor } from '@/features/map/types';
import { useAppointmentBookingStore } from '@/features/appointments/store/appointment-booking-store';
import { useMapAppointmentStore } from '@/features/map-appointment/store/map-appointment-store';
import { DEV_AUTH_DEFAULTS } from '@/features/phone-auth/data/dev-auth-defaults';

export type PhoneAuthStep = 'phone' | 'otp' | 'register' | 'profile';

export type PendingAuthAction =
  | { type: 'appointment'; doctor: MapDoctor }
  | { type: 'book-appointment'; doctorId?: string; patientId?: string }
  | { type: 'profile' }
  | { type: 'navigate'; href: string };

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
  phone: DEV_AUTH_DEFAULTS.phone,
  registrationToken: null,
  pendingAction: null as PendingAuthAction | null,
};

export const usePhoneAuthStore = create<PhoneAuthStore>((set, get) => ({
  ...initialState,
  openAuth: (options) =>
    set((state) => ({
      authOpen: true,
      step: options?.step ?? 'phone',
      phone: state.phone || DEV_AUTH_DEFAULTS.phone,
      pendingAction:
        options?.pendingAction === undefined
          ? state.pendingAction
          : options.pendingAction,
    })),
  setAuthOpen: (open) =>
    set((state) => ({
      authOpen: open,
      ...(open
        ? {
            phone: state.phone || DEV_AUTH_DEFAULTS.phone,
          }
        : {
            step: 'phone',
            phone: DEV_AUTH_DEFAULTS.phone,
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

    if (pendingAction.type === 'book-appointment') {
      useAppointmentBookingStore.getState().openBooking({
        doctorId: pendingAction.doctorId,
        patientId: pendingAction.patientId,
      });
      set({ pendingAction: null, authOpen: false });
      return;
    }

    if (pendingAction.type === 'navigate') {
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
      phone: DEV_AUTH_DEFAULTS.phone,
      registrationToken: null,
    }),
}));
