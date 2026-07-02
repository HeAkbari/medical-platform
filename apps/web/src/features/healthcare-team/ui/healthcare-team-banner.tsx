'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useHealthcareTeamStore } from '@/features/healthcare-team/store/healthcare-team-store';
import { useDoctorsQuery } from '@/hooks';
import { useAuth } from '@/lib/auth';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';

const HEALTHCARE_TEAM_HREF = '/healthcare-team';

export function HealthcareTeamBanner() {
  const { isAuthenticated } = useAuth();
  const { requireAuth, isLoading } = useRequireAuth();
  const homeScroll = useHomeScrollCapture();
  const familyPhysicianId = useHealthcareTeamStore(
    (state) => state.familyPhysicianId
  );
  const { data } = useDoctorsQuery();

  const familyPhysician = data?.data.find(
    (doctor) => doctor.id === familyPhysicianId
  );

  function handleGuestClick(event: React.MouseEvent<HTMLAnchorElement>) {
    homeScroll?.captureScroll();

    if (isLoading) {
      event.preventDefault();
      return;
    }

    const authorized = requireAuth({
      type: 'navigate',
      href: HEALTHCARE_TEAM_HREF,
    });

    if (!authorized) {
      event.preventDefault();
    }
  }

  if (!isAuthenticated) {
    return (
      <section aria-labelledby="healthcare-team-banner-heading">
        <h2 id="healthcare-team-banner-heading" className="sr-only">
          My Healthcare Team
        </h2>
        <Link
          href={HEALTHCARE_TEAM_HREF}
          scroll={false}
          onClick={handleGuestClick}
          className="block"
        >
          <Card className="border-brand-subtle bg-linear-to-br from-brand-muted to-card transition hover:border-brand-light hover:shadow-md active:scale-[0.99]">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              My Healthcare Team
            </p>
            <p className="mt-1 font-semibold text-foreground">
              Sign in to view your care team
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Access your family physician, visit history, and care milestones.
            </p>
          </Card>
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="healthcare-team-banner-heading">
      <h2 id="healthcare-team-banner-heading" className="sr-only">
        My Healthcare Team
      </h2>
      <Link href={HEALTHCARE_TEAM_HREF} scroll={false} className="block">
        <Card className="border-brand-subtle bg-linear-to-br from-brand-muted to-card transition hover:border-brand-light hover:shadow-md active:scale-[0.99]">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            My Healthcare Team
          </p>
          {familyPhysician ? (
            <>
              <p className="mt-1 font-semibold text-foreground">
                Dr. {familyPhysician.firstName} {familyPhysician.lastName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {familyPhysician.specialty} · View team dashboard and history
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 font-semibold text-foreground">
                Add your family physician
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your primary care provider to unlock care milestones.
              </p>
            </>
          )}
        </Card>
      </Link>
    </section>
  );
}
