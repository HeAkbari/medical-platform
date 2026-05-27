'use client';

import { Drawer } from 'vaul';
import React from 'react';

interface MapFilterProps {
  filterOpen: boolean;
  setFilterOpen: (value: boolean) => void;
}

export function MapFilter({ filterOpen, setFilterOpen }: MapFilterProps) {
  // const [open, setOpen] = React.useState(false);

  return (
    <Drawer.Root open={filterOpen} onOpenChange={setFilterOpen}>
      <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
        Open Drawer
      </Drawer.Trigger>
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
                {/* Specialty filter */}
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-slate-700">
                    Specialty
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'General',
                      'Cardiology',
                      'Dermatology',
                      'Pediatrics',
                      'Orthopedics',
                    ].map((specialty) => (
                      <label
                        key={specialty}
                        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition has-checked:border-teal-500 has-checked:bg-teal-50 has-checked:text-teal-800"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          value={specialty}
                        />
                        {specialty}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Distance filter */}
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-slate-700">
                    Max distance
                  </legend>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      defaultValue="10"
                      className="h-2 flex-1 appearance-none rounded-full bg-slate-200 accent-teal-600"
                    />
                    <span className="min-w-[3ch] text-sm font-medium text-slate-700">
                      10 km
                    </span>
                  </div>
                </fieldset>

                {/* Availability toggle */}
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-slate-700">
                    Availability
                  </legend>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300 text-teal-600 accent-teal-600"
                    />
                    <span className="text-sm text-slate-700">
                      Show only available today
                    </span>
                  </label>
                </fieldset>

                {/* Apply button */}
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 active:bg-teal-900"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
