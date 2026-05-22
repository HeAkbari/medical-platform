import type { AppointmentQueryInput } from '@medical-platform/domain/validation';

export const medicalQueryKeys = {
  all: ['medical'] as const,
  patients: () => [...medicalQueryKeys.all, 'patients'] as const,
  patient: (id: string) => [...medicalQueryKeys.patients(), id] as const,
  doctors: () => [...medicalQueryKeys.all, 'doctors'] as const,
  doctor: (id: string) => [...medicalQueryKeys.doctors(), id] as const,
  appointments: (filters?: AppointmentQueryInput) =>
    [...medicalQueryKeys.all, 'appointments', filters ?? {}] as const,
};
