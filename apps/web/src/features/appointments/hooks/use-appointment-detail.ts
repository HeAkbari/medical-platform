'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Appointment } from '@medical-platform/domain';
import { medicalQueryKeys } from '@/lib/api-client/query-keys';
import type { AppointmentDetail } from '../data/appointment-detail';

async function fetchAppointmentDetail(
  id: string
): Promise<AppointmentDetail> {
  const response = await fetch(`/api/v1/appointments/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load appointment detail');
  }
  const json = (await response.json()) as { data: AppointmentDetail };
  return json.data;
}

async function cancelAppointment(id: string): Promise<Appointment> {
  const response = await fetch(`/api/v1/appointments/${id}/cancel`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel appointment');
  }
  const json = (await response.json()) as { data: Appointment };
  return json.data;
}

export function useAppointmentDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['appointment-detail', id],
    queryFn: () => fetchAppointmentDetail(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: medicalQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: ['appointment-detail', id],
      });
    },
  });
}
