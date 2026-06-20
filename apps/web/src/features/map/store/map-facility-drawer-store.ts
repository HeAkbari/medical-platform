import { create } from 'zustand';
import type { MapFacility } from '../types';

export const SNAP_PEEK = '350px' as const;
export const SNAP_FULL = 0.95 as const;
export const FACILITY_DRAWER_SNAP_POINTS = [SNAP_PEEK, SNAP_FULL] as const;

interface MapFacilityDrawerStore {
  facility: MapFacility | null;
  isOpen: boolean;
  activeSnapPoint: number | string | null;
  userPosition: [number, number] | null;
  open: (facility: MapFacility, userPosition: [number, number]) => void;
  setOpen: (open: boolean) => void;
  setActiveSnapPoint: (snapPoint: number | string | null) => void;
}

export const useMapFacilityDrawerStore = create<MapFacilityDrawerStore>((set) => ({
  facility: null,
  isOpen: false,
  activeSnapPoint: SNAP_PEEK,
  userPosition: null,
  open: (facility, userPosition) =>
    set({ facility, isOpen: true, activeSnapPoint: SNAP_PEEK, userPosition }),
  // Keep facility/userPosition during the close animation so the content stays
  // rendered while Vaul slides the drawer down. They're overwritten on next open.
  setOpen: (open) => set({ isOpen: open }),
  setActiveSnapPoint: (snapPoint) => set({ activeSnapPoint: snapPoint }),
}));
