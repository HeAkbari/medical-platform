'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  HOME_MAP_CTA,
  HOME_SERVICE_ITEMS,
  HOME_SUPPORT_ITEMS,
} from '@/features/app-home/data/home-navigation';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';

// Real OpenStreetMap tile centred on the app's fallback map center
// (Victoria, BC — see FALLBACK_MAP_CENTER in lib/geo/constants).
const HOME_MAP_THUMBNAIL_URL =
  'https://tile.openstreetmap.org/13/1288/2833.png';

function ServiceIcon({ slug }: { slug: string }) {
  const common = 'h-6 w-6 text-brand';

  switch (slug) {
    case 'appointments':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
        </svg>
      );
    case 'test-results':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M8 4h8v16H8z" />
          <path d="M10 9h4M10 13h4M10 17h2" strokeLinecap="round" />
        </svg>
      );
    case 'advices':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M12 21s-6-3.6-6-9a6 6 0 1 1 12 0c0 5.4-6 9-6 9z" />
          <path d="M12 8v5M9.5 10.5h5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M6 4h12v16H6z" />
          <path d="M9 9h6M9 13h6" strokeLinecap="round" />
        </svg>
      );
  }
}

export function HomeHubPage() {
  const { requireAuth, isLoading } = useRequireAuth();
  const homeScroll = useHomeScrollCapture();

  function handleLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    requiresAuth: boolean,
  ) {
    homeScroll?.captureScroll();

    if (!requiresAuth) {
      return;
    }

    if (isLoading) {
      event.preventDefault();
      return;
    }

    const authorized = requireAuth({ type: 'navigate', href });
    if (!authorized) {
      event.preventDefault();
    }
  }

  return (
    <div className="space-y-2 pb-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          DrFinder
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Home
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Your health services and care information in one place.
        </p>
      </header>

      <section aria-labelledby="home-map-cta-heading">
        <h2 id="home-map-cta-heading" className="sr-only">
          Find doctors nearby
        </h2>
        <Link
          href={HOME_MAP_CTA.href}
          scroll={false}
          onClick={(event) => handleLinkClick(event, HOME_MAP_CTA.href, false)}
          className="block"
        >
          <Card className="relative flex border-0 items-center gap-3 overflow-hidden border-brand/40 p-4 shadow-sm ring-1 ring-brand-subtle/60 transition hover:border-brand/60 hover:shadow-md active:scale-[0.99]">
            {/* Real OpenStreetMap tile filling the whole card */}
            <span
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${HOME_MAP_THUMBNAIL_URL}")` }}
              aria-hidden="true"
            />
            {/* Scrim + inner shadow for text legibility */}
            <span
              className="absolute inset-0 bg-linear-to-r from-brand-darker/55"
              aria-hidden="true"
            />
            <span className="relative min-w-0 flex-1">
              <p className="font-semibold text-white drop-shadow-sm">
                {HOME_MAP_CTA.title}
              </p>
              <p className="mt-0.5 text-sm text-white/85 drop-shadow-sm">
                {HOME_MAP_CTA.description}
              </p>
            </span>
            <span className="relative shrink-0 text-white" aria-hidden="true">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M9 6l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Card>
        </Link>
      </section>

      <section aria-labelledby="home-services-heading">
        <h2
          id="home-services-heading"
          className="mb-3 text-sm font-semibold text-slate-800"
        >
          Services
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {HOME_SERVICE_ITEMS.map((item) => {
            const href = `/home/services/${item.slug}`;

            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  scroll={false}
                  onClick={(event) => handleLinkClick(event, href, true)}
                  className="block h-full"
                >
                  <Card className="flex h-full flex-col gap-1 transition hover:border-brand-subtle hover:shadow-md active:scale-[0.99]">
                    <ServiceIcon slug={item.slug} />
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-4 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="home-support-heading">
        <h2
          id="home-support-heading"
          className="mb-3 text-sm font-semibold text-slate-800"
        >
          Information and support
        </h2>
        <ul className="space-y-2">
          {HOME_SUPPORT_ITEMS.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                scroll={false}
                onClick={(event) => handleLinkClick(event, item.href, false)}
              >
                <Card className="transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99]">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
