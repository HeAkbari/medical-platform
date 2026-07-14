'use client';

import type { Doctor } from '@medical-platform/domain';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/ui/cn';
import { inputClassName } from '@/components/ui/input-styles';
import {
  filterDoctorsByQuery,
  HOME_SEARCH_CHIPS,
  type HomeSearchChip,
  type HomeSearchChipTone,
} from '@/features/app-home/data/home-search';
import { HomeSearchChipIconGlyph } from '@/features/app-home/ui/home-search-chip-icon';
import { useRequireAuth } from '@/features/phone-auth/hooks/use-require-auth';
import { useDoctorsQuery } from '@/hooks';
import { useHomeScrollCapture } from '@/lib/routing/home-scroll-context';

const POPOVER_RESULT_LIMIT = 5;

const CHIP_TONE_STYLES: Record<
  HomeSearchChipTone,
  { chip: string; icon: string; inlineIcon?: boolean }
> = {
  urgent: {
    chip: 'border-urgent-border bg-urgent-subtle text-urgent-foreground hover:border-urgent-foreground/25 hover:bg-urgent-subtle/80',
    icon: 'text-urgent-foreground',
    inlineIcon: true,
  },
  brand: {
    chip: 'border-brand-subtle bg-brand-muted/50 text-brand-dark hover:border-brand-light hover:bg-brand-muted',
    icon: 'text-brand',
  },
  sky: {
    chip: 'border-brand-subtle/60 bg-brand-muted text-info-foreground hover:border-brand-muted/30 hover:bg-brand-muted/80',
    icon: 'text-info-foreground',
  },
  teal: {
    chip: 'border-calm-foreground/20 bg-brand-muted text-calm-foreground hover:border-calm-foreground/30 hover:bg-calm-subtle/80',
    icon: 'text-calm-foreground',
  },
};

function getChipClassName(chip: HomeSearchChip): string {
  const tone = CHIP_TONE_STYLES[chip.tone];

  return cn(
    'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition active:scale-[0.98]',
    chip.tone === 'urgent' && 'px-4',
    tone.chip,
  );
}

function getChipIconClassName(chip: HomeSearchChip): string {
  const tone = CHIP_TONE_STYLES[chip.tone];

  if (tone.inlineIcon) {
    return 'flex shrink-0 items-center justify-center';
  }

  return cn(
    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
    tone.icon,
  );
}

function buildResultsHref(query: string): string {
  const trimmed = query.trim();
  return trimmed
    ? `/find-physician?q=${encodeURIComponent(trimmed)}`
    : '/find-physician';
}

export function HomeSearchPanel() {
  const router = useRouter();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { requireAuth, isLoading } = useRequireAuth();
  const homeScroll = useHomeScrollCapture();
  const { data, isLoading: isDoctorsLoading } = useDoctorsQuery();

  const doctors = useMemo(() => data?.data ?? [], [data?.data]);
  const trimmedQuery = query.trim();
  const matchingDoctors = useMemo(
    () => filterDoctorsByQuery(doctors, query, POPOVER_RESULT_LIMIT),
    [doctors, query],
  );
  const totalMatches = useMemo(
    () => filterDoctorsByQuery(doctors, query).length,
    [doctors, query],
  );
  const hasMoreResults = totalMatches > matchingDoctors.length;

  const showPopover =
    open &&
    (isDoctorsLoading || trimmedQuery.length > 0 || matchingDoctors.length > 0);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function navigateToResults(nextQuery = query) {
    homeScroll?.captureScroll();
    setOpen(false);
    setActiveIndex(-1);
    router.push(buildResultsHref(nextQuery));
  }

  function selectDoctor(doctor: Doctor) {
    const label = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    setQuery(label);
    navigateToResults(label);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateToResults();
  }

  function handleChipClick(
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

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showPopover) {
      if (event.key === 'ArrowDown' && matchingDoctors.length > 0) {
        setOpen(true);
        setActiveIndex(0);
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, matchingDoctors.length - 1),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const doctor = matchingDoctors[activeIndex];
      if (doctor) {
        selectDoctor(doctor);
      }
    }
  }

  return (
    <section aria-labelledby="home-search-heading" className="space-y-3">
      <h2 id="home-search-heading" className="sr-only">
        Search and triage
      </h2>

      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit}>
          <label htmlFor="home-unified-search" className="sr-only">
            Search providers, specialties, or topics
          </label>
          <input
            id="home-unified-search"
            type="search"
            role="combobox"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search providers, specialties, or topics"
            className={inputClassName}
            autoComplete="off"
            aria-expanded={showPopover}
            aria-controls={showPopover ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
          />
        </form>

        {showPopover ? (
          <div
            className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            role="presentation"
          >
            {isDoctorsLoading ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Loading physicians...
              </p>
            ) : matchingDoctors.length === 0 ? (
              <div className="px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  No physicians match &ldquo;{trimmedQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => navigateToResults()}
                  className="mt-2 text-sm font-medium text-brand hover:underline"
                >
                  Browse all physicians
                </button>
              </div>
            ) : (
              <>
                {trimmedQuery.length === 0 ? (
                  <p className="border-b border-border px-4 py-2 text-xs font-medium text-faint-foreground">
                    Suggested physicians
                  </p>
                ) : null}
                <ul
                  id={listboxId}
                  role="listbox"
                  className="max-h-72 overflow-y-auto py-1"
                >
                  {matchingDoctors.map((doctor, index) => (
                    <li key={doctor.id} role="presentation">
                      <button
                        type="button"
                        id={`${listboxId}-option-${index}`}
                        role="option"
                        aria-selected={activeIndex === index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectDoctor(doctor)}
                        className={cn(
                          'flex w-full flex-col gap-0.5 px-4 py-3 text-start transition',
                          activeIndex === index
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent',
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {doctor.specialty}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {!isDoctorsLoading && totalMatches > 0 ? (
              <div className="border-t border-border px-4 py-2">
                <button
                  type="button"
                  onClick={() => navigateToResults()}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {trimmedQuery.length > 0 && hasMoreResults
                    ? `View all ${totalMatches} results`
                    : 'View full results page'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

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
                  className={getChipClassName(chip)}
                >
                  <span className={getChipIconClassName(chip)}>
                    <HomeSearchChipIconGlyph icon={chip.icon} />
                  </span>
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
