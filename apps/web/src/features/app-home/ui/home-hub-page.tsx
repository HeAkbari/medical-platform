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

function ServiceIcon({ slug }: { slug: string }) {
  const common = 'h-6 w-6 text-brand';

  switch (slug) {
    case 'prescriptions':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
        </svg>
      );
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
    case 'vaccinations':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="m8 16 8-8M9 7l2 2M15 15l2 2" strokeLinecap="round" />
          <path d="M6 18 4 20M18 6l2-2" strokeLinecap="round" />
        </svg>
      );
    case 'health-conditions':
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
    <div className="space-y-6 pb-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Medical Platform
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Home
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Your health services and CHS information in one place.
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
          <Card className="flex items-center gap-3 border-brand/40 bg-brand-muted/80 p-4 shadow-sm ring-1 ring-brand-subtle/60 transition hover:border-brand/60 hover:bg-brand-muted hover:shadow-md active:scale-[0.99]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <p className="font-semibold text-brand-darker">
                {HOME_MAP_CTA.title}
              </p>
              <p className="mt-0.5 text-sm text-brand-dark">
                {HOME_MAP_CTA.description}
              </p>
            </span>
            <span className="shrink-0 text-brand" aria-hidden="true">
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
                  <Card className="flex h-full flex-col gap-3 transition hover:border-brand-subtle hover:shadow-md active:scale-[0.99]">
                    <ServiceIcon slug={item.slug} />
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
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
