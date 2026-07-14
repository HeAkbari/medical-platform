'use client';

import { Card } from '@/components/ui/card';
import { HOME_SUPPORT_ITEMS } from '@/features/app-home/data/home-navigation';
import { HomeMapCard } from '@/features/app-home/ui/home-map-card';
import { HomeRecommendedPhysicians } from '@/features/app-home/ui/home-recommended-physicians';
import { HomeSearchPanel } from '@/features/app-home/ui/home-search-panel';
import { HomeSupportIconGlyph } from '@/features/app-home/ui/home-support-icon';
import { HealthcareTeamBanner } from '@/features/healthcare-team/ui/healthcare-team-banner';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';
import Link from 'next/link';

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

      <HomeMapCard />

      {/* <section aria-labelledby="home-services-heading">
        <h2
          id="home-services-heading"
          className="mb-3 text-sm font-semibold text-subtle-foreground"
        >
          Services
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {HOME_SERVICE_ITEMS.map((item) => {
            const href = `/services/${item.slug}`;

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
      <HomeRecommendedPhysicians />

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
                <Card className="flex items-start gap-3 transition hover:border-brand-subtle hover:shadow-sm active:scale-[0.99]">
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"
                    aria-hidden="true"
                  >
                    <HomeSupportIconGlyph icon={item.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-faint-foreground">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
