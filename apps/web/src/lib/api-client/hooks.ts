'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type {
  ApiListResponse,
  Appointment,
  Doctor,
  Patient,
} from '@medical-platform/domain';
import type {
  AppointmentQueryInput,
  CreateAppointmentInput,
} from '@medical-platform/domain/validation';
import { medicalApiClient } from './medical-api-client';
import { medicalQueryKeys } from './query-keys';

export function usePatientsQuery(
  options?: Omit<
    UseQueryOptions<ApiListResponse<Patient>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: medicalQueryKeys.patients(),
    queryFn: () => medicalApiClient.getPatients(),
    ...options,
  });
}

export function usePatientQuery(
  id: string,
  options?: Omit<UseQueryOptions<{ data: Patient }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: medicalQueryKeys.patient(id),
    queryFn: () => medicalApiClient.getPatient(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useDoctorsQuery(
  options?: Omit<
    UseQueryOptions<ApiListResponse<Doctor>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: medicalQueryKeys.doctors(),
    queryFn: () => medicalApiClient.getDoctors(),
    ...options,
  });
}

export function useAppointmentsQuery(
  filters?: AppointmentQueryInput,
  options?: Omit<
    UseQueryOptions<ApiListResponse<Appointment>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: medicalQueryKeys.appointments(filters),
    queryFn: () => medicalApiClient.getAppointments(filters),
    ...options,
  });
}

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) =>
      medicalApiClient.createAppointment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: medicalQueryKeys.all,
      });
    },
  });
}
