'use client';

import { Drawer } from 'vaul';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import { DOCTOR_SPECIALTIES } from '@/features/map/constants';
import { useMapFilterStore } from '@/features/map/store/map-filter-store';

interface MapFilterProps {
  filterOpen: boolean;
  setFilterOpen: (value: boolean) => void;
}

export function MapFilter({ filterOpen, setFilterOpen }: MapFilterProps) {
  const selectedSpecialties = useMapFilterStore(
    (state) => state.selectedSpecialties
  );
  const maxDistanceKm = useMapFilterStore((state) => state.maxDistanceKm);
  const availableTodayOnly = useMapFilterStore(
    (state) => state.availableTodayOnly
  );
  const toggleSpecialty = useMapFilterStore((state) => state.toggleSpecialty);
  const setMaxDistanceKm = useMapFilterStore((state) => state.setMaxDistanceKm);
  const setAvailableTodayOnly = useMapFilterStore(
    (state) => state.setAvailableTodayOnly
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
          Filter
        </Drawer.Title>

        <div className="flex flex-col gap-6 pt-2">
          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Specialty
            </legend>
            <div className="flex flex-wrap gap-2">
              {DOCTOR_SPECIALTIES.map((specialty) => {
                const isSelected = selectedSpecialties.includes(specialty);

                return (
                  <label
                    key={specialty}
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
                      onChange={() => toggleSpecialty(specialty)}
                    />
                    {specialty}
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

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Availability
            </legend>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={availableTodayOnly}
                onChange={(event) =>
                  setAvailableTodayOnly(event.target.checked)
                }
                className="h-5 w-5 rounded border-slate-300 text-brand-light accent-brand-light"
              />
              <span className="text-sm text-slate-700">
                Show only available today
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
