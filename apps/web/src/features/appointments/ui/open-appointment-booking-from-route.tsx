'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPhysicianBookingHref } from '@/features/physician-booking/lib/routes';

/**
 * Legacy deep-link helper: `/services/appointments/new?doctorId=...`
 * now routes into the physician booking page instead of the old drawer.
 */
export function OpenAppointmentBookingFromRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (hasOpenedRef.current) {
      return;
    }

    hasOpenedRef.current = true;
    const doctorId = searchParams.get('doctorId');
    router.replace(
      doctorId ? getPhysicianBookingHref(doctorId) : '/find-physician'
    );
  }, [router, searchParams]);

  return null;
}
