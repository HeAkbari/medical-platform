'use client';

import { useEffect, useState } from 'react';
import { AppTabShell } from '@/components/layout/app-tab-shell';
import { AppIntroScreen } from '@/features/home/ui/app-intro-screen';
import { AppointmentBookingDrawer } from '@/features/appointments/ui/appointment-booking-drawer';
import { PhoneAuthDrawer } from '@/features/phone-auth/phone-auth-drawer';

const INTRO_STORAGE_KEY = 'medical-platform:intro-seen';

function readIntroSeen(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(INTRO_STORAGE_KEY) === '1';
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setShowIntro(!readIntroSeen());
  }, []);

  function handleIntroComplete() {
    sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    setShowIntro(false);
  }

  return (
    <>
      <AppTabShell>{children}</AppTabShell>
      <PhoneAuthDrawer />
      <AppointmentBookingDrawer />
      {showIntro ? <AppIntroScreen onComplete={handleIntroComplete} /> : null}
    </>
  );
}
