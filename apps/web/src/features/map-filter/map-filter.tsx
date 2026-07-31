'use client';

import { Drawer } from 'vaul';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { FACILITY_SUPER_CATEGORIES } from '@/features/map/types';
import {
  CATEGORY_LABELS,
  GENDER_FILTER_OPTIONS,
  MAP_LANGUAGE_OPTIONS,
  REGISTRATION_STATUS_FILTER_OPTIONS,
  SERVICE_OFFERING_FILTER_OPTIONS,
} from '@/features/map/constants';
import { useMapFilterStore } from '@/features/map/store/map-filter-store';

interface MapFilterProps {
  filterOpen: boolean;
  setFilterOpen: (value: boolean) => void;
}

function FilterPillGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-accent-foreground">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.id === value;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                isSelected
                  ? 'border-brand-light bg-brand-muted text-brand-dark'
                  : 'border-border text-accent-foreground'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={isSelected}
                onChange={() => onChange(option.id)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function MapFilter({ filterOpen, setFilterOpen }: MapFilterProps) {
  const selectedSuperCategories = useMapFilterStore(
    (state) => state.selectedSuperCategories,
  );
  const maxDistanceKm = useMapFilterStore((state) => state.maxDistanceKm);
  const openNowOnly = useMapFilterStore((state) => state.openNowOnly);
  const is24HoursOnly = useMapFilterStore((state) => state.is24HoursOnly);
  const gender = useMapFilterStore((state) => state.gender);
  const language = useMapFilterStore((state) => state.language);
  const serviceOffering = useMapFilterStore((state) => state.serviceOffering);
  const registrationStatus = useMapFilterStore(
    (state) => state.registrationStatus,
  );
  const toggleSuperCategory = useMapFilterStore(
    (state) => state.toggleSuperCategory,
  );
  const setMaxDistanceKm = useMapFilterStore((state) => state.setMaxDistanceKm);
  const setOpenNowOnly = useMapFilterStore((state) => state.setOpenNowOnly);
  const setIs24HoursOnly = useMapFilterStore((state) => state.setIs24HoursOnly);
  const setGender = useMapFilterStore((state) => state.setGender);
  const setLanguage = useMapFilterStore((state) => state.setLanguage);
  const setServiceOffering = useMapFilterStore(
    (state) => state.setServiceOffering,
  );
  const setRegistrationStatus = useMapFilterStore(
    (state) => state.setRegistrationStatus,
  );
  const resetFilters = useMapFilterStore((state) => state.resetFilters);

  return (
    <ResponsiveDrawer
      open={filterOpen}
      onOpenChange={setFilterOpen}
      variant="tall"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        <Drawer.Title className="mb-4 font-medium text-foreground">
          Filter care on map
        </Drawer.Title>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pt-2 pb-2">
          <FilterPillGroup
            legend="Gender"
            options={GENDER_FILTER_OPTIONS}
            value={gender}
            onChange={setGender}
          />

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-accent-foreground">
              Language
            </legend>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-accent-foreground"
            >
              <option value="all">All</option>
              {MAP_LANGUAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </fieldset>

          <FilterPillGroup
            legend="Further filtering"
            options={SERVICE_OFFERING_FILTER_OPTIONS}
            value={serviceOffering}
            onChange={setServiceOffering}
          />

          <FilterPillGroup
            legend="Registering new patients"
            options={REGISTRATION_STATUS_FILTER_OPTIONS}
            value={registrationStatus}
            onChange={setRegistrationStatus}
          />
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-accent-foreground">
              Care type
            </legend>
            <div className="flex flex-wrap gap-2">
              {FACILITY_SUPER_CATEGORIES.map((category) => {
                const isSelected = selectedSuperCategories.includes(category);

                return (
                  <label
                    key={category}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      isSelected
                        ? 'border-brand-light bg-brand-muted text-brand-dark'
                        : 'border-border text-accent-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleSuperCategory(category)}
                    />
                    {CATEGORY_LABELS[category]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-accent-foreground">
              Max distance
            </legend>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                value={maxDistanceKm}
                onChange={(event) =>
                  setMaxDistanceKm(Number(event.target.value))
                }
                className="h-2 flex-1 appearance-none rounded-full bg-muted accent-brand-light"
              />
              <span className="min-w-[4.5rem] text-sm font-medium text-accent-foreground">
                {maxDistanceKm} km
              </span>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium text-accent-foreground">
              Availability
            </legend>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(event) => setOpenNowOnly(event.target.checked)}
                className="h-5 w-5 rounded border-border text-brand-light accent-brand-light"
              />
              <span className="text-sm text-accent-foreground">Open now</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={is24HoursOnly}
                onChange={(event) => setIs24HoursOnly(event.target.checked)}
                className="h-5 w-5 rounded border-border text-brand-light accent-brand-light"
              />
              <span className="text-sm text-accent-foreground">24 hours</span>
            </label>
          </fieldset>
        </div>

        <div className="mt-4 flex shrink-0 gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-muted"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setFilterOpen(false)}
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground transition hover:bg-brand-dark active:bg-brand-darker"
          >
            Apply filters
          </button>
        </div>
      </div>
    </ResponsiveDrawer>
  );
}
