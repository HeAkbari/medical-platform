'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppointmentBookingStore } from '@/features/appointments/store/appointment-booking-store';

const APPOINTMENTS_LIST_PATH = '/services/appointments';

export function OpenAppointmentBookingFromRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openBooking = useAppointmentBookingStore((state) => state.openBooking);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (hasOpenedRef.current) {
      return;
    }

    hasOpenedRef.current = true;
    openBooking({
      doctorId: searchParams.get('doctorId') ?? undefined,
      patientId: searchParams.get('patientId') ?? undefined,
    });
    router.replace(APPOINTMENTS_LIST_PATH);
  }, [openBooking, router, searchParams]);

  return null;
}
