import type { AppointmentQueryInput } from '@medical-platform/domain/validation';

export const medicalQueryKeys = {
  all: ['medical'] as const,
  patients: () => [...medicalQueryKeys.all, 'patients'] as const,
  patient: (id: string) => [...medicalQueryKeys.patients(), id] as const,
  doctors: () => [...medicalQueryKeys.all, 'doctors'] as const,
  doctor: (id: string) => [...medicalQueryKeys.doctors(), id] as const,
  doctorWorkingDays: (id: string, year: number, month: number, visitType: string) =>
    [...medicalQueryKeys.doctor(id), 'workingDays', year, month, visitType] as const,
  doctorAvailableSlots: (id: string, date: string, visitType: string) =>
    [...medicalQueryKeys.doctor(id), 'availableSlots', date, visitType] as const,
  appointments: (filters?: AppointmentQueryInput) =>
    [...medicalQueryKeys.all, 'appointments', filters ?? {}] as const,
};
