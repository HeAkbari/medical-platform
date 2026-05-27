'use client';

import { Drawer } from 'vaul';
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
    <Drawer.Root open={filterOpen} onOpenChange={setFilterOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] mt-24 h-fit fixed bottom-0 left-0 right-0 outline-none">
          <div className="p-4 bg-white rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
            <div className="max-w-md mx-auto">
              <Drawer.Title className="font-medium mb-4 text-gray-900">
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
                              ? 'border-teal-500 bg-teal-50 text-teal-800'
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
                      className="h-2 flex-1 appearance-none rounded-full bg-slate-200 accent-teal-600"
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
                      className="h-5 w-5 rounded border-slate-300 text-teal-600 accent-teal-600"
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
                    className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 active:bg-teal-900"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
