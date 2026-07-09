'use client';

import { useRef, useState } from 'react';
import { useMapFilterStore } from '@/features/map/store/map-filter-store';

export function MapSearchBar() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resetFilters = useMapFilterStore((state) => state.resetFilters);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // UI-only stub: geocoding / map re-centering deferred to Phase 8
    inputRef.current?.blur();
  }

  function handleClear() {
    setQuery('');
    resetFilters();
    inputRef.current?.focus();
  }

  return (
    <div className="px-4 pb-2 pt-2">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="map-place-search" className="sr-only">
          Search clinics, pharmacies, or providers
        </label>
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-muted-foreground"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id="map-place-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clinics, pharmacies, providers…"
            className="h-11 w-full rounded-xl border border-border/80 bg-surface/95 ps-9 pe-9 text-sm text-foreground placeholder:text-faint-foreground shadow-sm backdrop-blur-md focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute inset-y-0 inset-e-3 flex items-center text-muted-foreground transition hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
