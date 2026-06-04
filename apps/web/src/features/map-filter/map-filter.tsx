'use client';

import { Drawer } from 'vaul';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { FACILITY_SUPER_CATEGORIES } from '@/features/map/types';
import { CATEGORY_LABELS } from '@/features/map/constants';
import { useMapFilterStore } from '@/features/map/store/map-filter-store';

interface MapFilterProps {
  filterOpen: boolean;
  setFilterOpen: (value: boolean) => void;
}

export function MapFilter({ filterOpen, setFilterOpen }: MapFilterProps) {
  const selectedSuperCategories = useMapFilterStore(
    (state) => state.selectedSuperCategories
  );
  const maxDistanceKm = useMapFilterStore((state) => state.maxDistanceKm);
  const openNowOnly = useMapFilterStore((state) => state.openNowOnly);
  const is24HoursOnly = useMapFilterStore((state) => state.is24HoursOnly);
  const acceptingNewPatientsOnly = useMapFilterStore(
    (state) => state.acceptingNewPatientsOnly
  );
  const toggleSuperCategory = useMapFilterStore(
    (state) => state.toggleSuperCategory
  );
  const setMaxDistanceKm = useMapFilterStore((state) => state.setMaxDistanceKm);
  const setOpenNowOnly = useMapFilterStore((state) => state.setOpenNowOnly);
  const setIs24HoursOnly = useMapFilterStore((state) => state.setIs24HoursOnly);
  const setAcceptingNewPatientsOnly = useMapFilterStore(
    (state) => state.setAcceptingNewPatientsOnly
  );
  const resetFilters = useMapFilterStore((state) => state.resetFilters);

  return (
    <ResponsiveDrawer
      open={filterOpen}
      onOpenChange={setFilterOpen}
      variant="fit"
    >
      <div className="mx-auto max-w-md">
        <Drawer.Title className="mb-4 font-medium text-gray-900">
          Filter care on map
        </Drawer.Title>

        <div className="flex flex-col gap-6 pt-2">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
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
                        : 'border-slate-200 text-slate-700'
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
            <legend className="mb-3 text-sm font-medium text-slate-700">
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
                className="h-2 flex-1 appearance-none rounded-full bg-slate-200 accent-brand-light"
              />
              <span className="min-w-[4.5rem] text-sm font-medium text-slate-700">
                {maxDistanceKm} km
              </span>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Availability
            </legend>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(event) => setOpenNowOnly(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-brand-light accent-brand-light"
              />
              <span className="text-sm text-slate-700">Open now</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={is24HoursOnly}
                onChange={(event) => setIs24HoursOnly(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-brand-light accent-brand-light"
              />
              <span className="text-sm text-slate-700">24 hours</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={acceptingNewPatientsOnly}
                onChange={(event) =>
                  setAcceptingNewPatientsOnly(event.target.checked)
                }
                className="h-5 w-5 rounded border-slate-300 text-brand-light accent-brand-light"
              />
              <span className="text-sm text-slate-700">
                Accepting new patients (primary care)
              </span>
            </label>
          </fieldset>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
      </div>
    </ResponsiveDrawer>
  );
}
