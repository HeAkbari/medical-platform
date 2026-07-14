'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@/components/ui';
import { PhysicianAvatar } from '@/features/doctors';
import { getPhysicianBookingHref } from '@/features/physician-booking/lib/routes';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';
import { useDoctorsQuery } from '@/hooks';
import type { Doctor } from '@medical-platform/domain';

const PREVIEW_COUNT = 2;
const SEE_ALL_HREF = '/find-physician';

const RECOMMENDED_META = [
  { rating: 4.9, distanceKm: 1.2, sponsored: true },
  { rating: 4.8, distanceKm: 0.8, sponsored: false },
] as const;

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-amber-400"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function RecommendedPhysicianCard({
  doctor,
  rating,
  distanceKm,
  sponsored,
  onBook,
}: {
  doctor: Doctor;
  rating: number;
  distanceKm: number;
  sponsored: boolean;
  onBook: () => void;
}) {
  return (
    <Card className="flex h-full items-center gap-2.5 border-brand-subtle/70 p-3 sm:p-3">
      <Link
        href={`/physicians/${doctor.id}`}
        className="flex min-w-0 flex-1 items-center gap-2.5"
      >
        <PhysicianAvatar
          firstName={doctor.firstName}
          lastName={doctor.lastName}
          doctorId={doctor.id}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-h-5 items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-foreground">
              Dr. {doctor.firstName} {doctor.lastName}
            </p>
            {sponsored ? (
              <Badge
                variant="default"
                className="shrink-0 px-1.5 py-0 text-[10px] uppercase tracking-wide"
              >
                Sponsored
              </Badge>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {doctor.specialty}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-0.5 font-medium text-subtle-foreground">
              <StarIcon />
              {rating.toFixed(1)}
            </span>
            <span className="text-faint-foreground">
              {distanceKm.toFixed(1)} km
            </span>
          </div>
        </div>
      </Link>
      <Button
        type="button"
        className="min-h-9 shrink-0 rounded-xl px-3.5 py-2 text-sm"
        onClick={onBook}
      >
        Book
      </Button>
    </Card>
  );
}

export function HomeRecommendedPhysicians() {
  const router = useRouter();
  const { data, isLoading, isError } = useDoctorsQuery();
  const { requireAuth, isLoading: isAuthLoading } = useRequireAuth();
  const homeScroll = useHomeScrollCapture();

  const doctors = (data?.data ?? []).slice(0, PREVIEW_COUNT);

  function handleSeeAllClick(event: React.MouseEvent<HTMLAnchorElement>) {
    homeScroll?.captureScroll();
    if (isAuthLoading) {
      event.preventDefault();
    }
  }

  function handleBook(doctorId: string) {
    homeScroll?.captureScroll();
    const href = getPhysicianBookingHref(doctorId);
    requireAuth({ type: 'navigate', href }, () => {
      router.push(href);
    });
  }

  if (isError) {
    return null;
  }

  return (
    <section aria-labelledby="home-recommended-physicians-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id="home-recommended-physicians-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Recommended physicians
        </h2>
        <Link
          href={SEE_ALL_HREF}
          scroll={false}
          onClick={handleSeeAllClick}
          className="shrink-0 text-sm font-medium text-brand transition hover:text-brand-dark"
        >
          See all
        </Link>
      </div>

      {isLoading ? (
        <ul className="space-y-2" aria-busy="true" aria-label="Loading physicians">
          {Array.from({ length: PREVIEW_COUNT }, (_, index) => (
            <li key={index} className="h-[4.5rem]">
              <Card className="flex h-full items-center gap-2.5 border-brand-subtle/70 p-3">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-brand-muted" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-36 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-9 w-14 shrink-0 animate-pulse rounded-xl bg-brand-muted" />
              </Card>
            </li>
          ))}
        </ul>
      ) : doctors.length === 0 ? (
        <Card className="border-brand-subtle/70">
          <p className="text-sm text-muted-foreground">
            No recommended physicians right now.
          </p>
          <Link
            href={SEE_ALL_HREF}
            scroll={false}
            onClick={handleSeeAllClick}
            className="mt-2 inline-flex text-sm font-medium text-brand"
          >
            Browse all physicians
          </Link>
        </Card>
      ) : (
        <ul className="space-y-2">
          {doctors.map((doctor, index) => {
            const meta = RECOMMENDED_META[index] ?? RECOMMENDED_META[1];

            return (
              <li key={doctor.id} className="h-[4.5rem]">
                <RecommendedPhysicianCard
                  doctor={doctor}
                  rating={meta.rating}
                  distanceKm={meta.distanceKm}
                  sponsored={meta.sponsored}
                  onBook={() => handleBook(doctor.id)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
