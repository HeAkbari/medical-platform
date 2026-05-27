'use client';

import { MAP_NEED_OPTIONS, DOCTOR_SPECIALTIES } from '@/features/map/constants';
import { useMapFilterStore } from '@/features/map/store/map-filter-store';
import type { MapNeedOptionId } from '@/features/map/constants';
import type { DoctorSpecialty } from '@/features/map/types';

function getActiveNeedId(
  selectedSpecialties: DoctorSpecialty[]
): MapNeedOptionId | null {
  if (selectedSpecialties.length === DOCTOR_SPECIALTIES.length) {
    return 'all';
  }

  if (selectedSpecialties.length === 1) {
    return selectedSpecialties[0];
  }

  return null;
}

export function MapNeedSelector() {
  const selectedSpecialties = useMapFilterStore(
    (state) => state.selectedSpecialties
  );
  const selectQuickNeed = useMapFilterStore((state) => state.selectQuickNeed);
  const activeNeedId = getActiveNeedId(selectedSpecialties);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] bg-gradient-to-t from-white/95 via-white/80 to-transparent px-4 pb-4 pt-8"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="map-need-scroll pointer-events-auto flex gap-2 overflow-x-auto pb-1">
        {MAP_NEED_OPTIONS.map((option) => {
          const isActive =
            activeNeedId !== null && activeNeedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectQuickNeed(option.id)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium whitespace-nowrap shadow-sm transition active:scale-95 ${
                isActive
                  ? 'border-teal-600 bg-teal-700 text-white'
                  : 'border-slate-200/80 bg-white/95 text-slate-700 backdrop-blur-md hover:bg-white'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
