export const medicalQueryKeys = {
  all: ['medical'] as const,
  patients: () => [...medicalQueryKeys.all, 'patients'] as const,
  patient: (id: string) => [...medicalQueryKeys.patients(), id] as const,
  doctors: () => [...medicalQueryKeys.all, 'doctors'] as const,
  doctor: (id: string) => [...medicalQueryKeys.doctors(), id] as const,
  appointments: (filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
  }) => [...medicalQueryKeys.all, 'appointments', filters ?? {}] as const,
};
