'use client';

import { Card } from '@/components/ui/card';
import {
  HOME_MAP_CTA,
  HOME_SUPPORT_ITEMS,
} from '@/features/app-home/data/home-navigation';
import { HomeSearchPanel } from '@/features/app-home/ui/home-search-panel';
import { HealthcareTeamBanner } from '@/features/healthcare-team/ui/healthcare-team-banner';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';
import Link from 'next/link';

// Real OpenStreetMap tile centred on the app's fallback map center
// (Victoria, BC — see FALLBACK_MAP_CENTER in lib/geo/constants).
const HOME_MAP_THUMBNAIL_URL =
  'https://tile.openstreetmap.org/13/1288/2833.png';

// function ServiceIcon({ slug }: { slug: string }) {
//   const common = 'h-6 w-6 text-brand';

//   switch (slug) {
//     case 'appointments':
//       return (
//         <svg
//           className={common}
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           aria-hidden="true"
//         >
//           <rect x="4" y="5" width="16" height="15" rx="2" />
//           <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
//         </svg>
//       );
//     case 'test-results':
//       return (
//         <svg
//           className={common}
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           aria-hidden="true"
//         >
//           <path d="M8 4h8v16H8z" />
//           <path d="M10 9h4M10 13h4M10 17h2" strokeLinecap="round" />
//         </svg>
//       );
//     case 'advices':
//       return (
//         <svg
//           className={common}
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           aria-hidden="true"
//         >
//           <path d="M12 21s-6-3.6-6-9a6 6 0 1 1 12 0c0 5.4-6 9-6 9z" />
//           <path d="M12 8v5M9.5 10.5h5" strokeLinecap="round" />
//         </svg>
//       );
//     default:
//       return (
//         <svg
//           className={common}
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           aria-hidden="true"
//         >
//           <path d="M6 4h12v16H6z" />
//           <path d="M9 9h6M9 13h6" strokeLinecap="round" />
//         </svg>
//       );
//   }
// }

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
      {/* <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          DrFinder
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Home
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your health services and care information in one place.
        </p>
      </header> */}

      <HomeSearchPanel />

      <HealthcareTeamBanner />

      {/* Symptom Checker entry block (P8) */}
      <section aria-labelledby="symptom-checker-entry-heading">
        <h2 id="symptom-checker-entry-heading" className="sr-only">
          Symptom Checker
        </h2>
        <Link
          href="/home/services/symptom-checker"
          scroll={false}
          onClick={(event) =>
            handleLinkClick(event, '/home/services/symptom-checker', false)
          }
          className="block"
        >
          <Card className="relative overflow-hidden border-brand-subtle bg-linear-to-br from-brand-muted via-brand-muted/60 to-card transition hover:border-brand-light hover:shadow-md active:scale-[0.99]">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-5 w-5 text-brand"
                >
                  <path
                    d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  AI Symptom Checker
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Describe your symptoms and get guidance on your next step —
                  self-care, book an appointment, or seek urgent care.
                </p>
                <p className="mt-2 text-xs text-faint-foreground">
                  Non-diagnostic · For emergencies, call 911
                </p>
              </div>
              <span className="shrink-0 text-brand" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-4 w-4"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Card>
        </Link>
      </section>

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
          <Card className="relative flex items-center gap-3 overflow-hidden border-brand-subtle p-4 shadow-sm transition hover:border-brand-light hover:shadow-md active:scale-[0.99]">
            {/* Real OpenStreetMap tile filling the whole card */}
            <span
              className="absolute inset-0 bg-cover bg-center dark:brightness-[0.72] dark:saturate-[0.65]"
              style={{ backgroundImage: `url("${HOME_MAP_THUMBNAIL_URL}")` }}
              aria-hidden="true"
            />
            {/* Scrim for text legibility — green tint in light, subtle dark wash in dark */}
            <span
              className="absolute inset-0 bg-linear-to-r from-brand-darker/55 dark:from-background/70 dark:via-brand-muted/40 dark:to-transparent"
              aria-hidden="true"
            />
            <span className="relative min-w-0 flex-1">
              <p className="font-semibold text-white drop-shadow-sm dark:text-foreground dark:drop-shadow-none">
                {HOME_MAP_CTA.title}
              </p>
              <p className="mt-0.5 text-sm text-white/85 drop-shadow-sm dark:text-muted-foreground dark:drop-shadow-none">
                {HOME_MAP_CTA.description}
              </p>
            </span>
            <span
              className="relative shrink-0 text-white dark:text-brand"
              aria-hidden="true"
            >
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

      {/* <section aria-labelledby="home-services-heading">
        <h2
          id="home-services-heading"
          className="mb-3 text-sm font-semibold text-subtle-foreground"
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
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-4 text-faint-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </section> */}

      <section aria-labelledby="home-support-heading">
        <h2
          id="home-support-heading"
          className="mb-3 text-sm font-semibold text-subtle-foreground"
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
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-faint-foreground">
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
