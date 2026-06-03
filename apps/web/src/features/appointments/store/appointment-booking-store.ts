import { create } from 'zustand';

export interface AppointmentBookingOptions {
  doctorId?: string;
  patientId?: string;
}

interface AppointmentBookingStore {
  bookingOpen: boolean;
  initialDoctorId: string;
  initialPatientId: string;
  openBooking: (options?: AppointmentBookingOptions) => void;
  setBookingOpen: (open: boolean) => void;
}

export const useAppointmentBookingStore = create<AppointmentBookingStore>((set) => ({
  bookingOpen: false,
  initialDoctorId: '',
  initialPatientId: '',
  openBooking: (options) =>
    set({
      bookingOpen: true,
      initialDoctorId: options?.doctorId ?? '',
      initialPatientId: options?.patientId ?? '',
    }),
  setBookingOpen: (open) =>
    set((state) => ({
      bookingOpen: open,
      ...(open
        ? {}
        : {
            initialDoctorId: '',
            initialPatientId: '',
          }),
    })),
}));
