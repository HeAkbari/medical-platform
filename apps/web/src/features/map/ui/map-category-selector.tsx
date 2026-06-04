'use client';

import { MAP_CATEGORY_OPTIONS } from '@/features/map/constants';
import { FACILITY_SUPER_CATEGORIES } from '@/features/map/types';
import { useMapFilterStore } from '@/features/map/store/map-filter-store';
import { useMapNavigationStore } from '@/features/map/store/map-navigation-store';
import type { MapCategoryOptionId } from '@/features/map/constants';
import type { FacilitySuperCategory } from '@/features/map/types';

function getActiveCategoryId(
  selectedSuperCategories: FacilitySuperCategory[]
): MapCategoryOptionId | null {
  if (selectedSuperCategories.length === FACILITY_SUPER_CATEGORIES.length) {
    return 'all';
  }

  if (selectedSuperCategories.length === 1) {
    return selectedSuperCategories[0];
  }

  return null;
}

export function MapCategorySelector() {
  const selectedSuperCategories = useMapFilterStore(
    (state) => state.selectedSuperCategories
  );
  const selectQuickCategory = useMapFilterStore(
    (state) => state.selectQuickCategory
  );
  const navigationStatus = useMapNavigationStore((state) => state.status);
  const activeCategoryId = getActiveCategoryId(selectedSuperCategories);

  if (navigationStatus !== 'idle') {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-[1000] px-4">
      <div className="map-need-scroll pointer-events-auto flex gap-2 overflow-x-auto pb-1">
        {MAP_CATEGORY_OPTIONS.map((option) => {
          const isActive =
            activeCategoryId !== null && activeCategoryId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectQuickCategory(option.id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap shadow-sm transition active:scale-95 ${
                isActive
                  ? 'border-brand-light bg-brand text-brand-foreground'
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
