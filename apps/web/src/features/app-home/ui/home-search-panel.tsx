'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { inputClassName } from '@/components/ui/input-styles';
import { HOME_SEARCH_CHIPS } from '@/features/app-home/data/home-search';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';

export function HomeSearchPanel() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { requireAuth, isLoading } = useRequireAuth();
  const homeScroll = useHomeScrollCapture();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    homeScroll?.captureScroll();

    const trimmed = query.trim();
    const href = trimmed
      ? `/home/find-physician?q=${encodeURIComponent(trimmed)}`
      : '/home/find-physician';

    router.push(href);
  }

  function handleChipClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    requiresAuth: boolean
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
    <section aria-labelledby="home-search-heading" className="space-y-3">
      <h2 id="home-search-heading" className="sr-only">
        Search and triage
      </h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="home-unified-search" className="sr-only">
          Search providers, specialties, or topics
        </label>
        <input
          id="home-unified-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search providers, specialties, or topics"
          className={inputClassName}
          autoComplete="off"
        />
      </form>

      <div className="scrollbar-none -mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-2">
          {HOME_SEARCH_CHIPS.map((chip) => {
            const requiresAuth = chip.id === 'urgent';

            return (
              <li key={chip.id}>
                <Link
                  href={chip.href}
                  scroll={chip.href === '/home/map' ? false : undefined}
                  onClick={(event) =>
                    handleChipClick(event, chip.href, requiresAuth)
                  }
                  title={chip.description}
                  className="inline-flex min-h-9 items-center rounded-full border border-brand-subtle bg-card px-3.5 text-sm font-medium text-brand-dark transition hover:border-brand-light hover:bg-brand-muted active:scale-[0.98]"
                >
                  {chip.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
