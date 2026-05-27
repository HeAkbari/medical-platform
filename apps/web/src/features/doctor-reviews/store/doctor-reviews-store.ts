import { create } from 'zustand';
import type { MapDoctor } from '@/features/map/types';

interface DoctorReviewsStore {
  reviewsOpen: boolean;
  selectedDoctor: MapDoctor | null;
  openReviews: (doctor: MapDoctor) => void;
  setReviewsOpen: (open: boolean) => void;
}

export const useDoctorReviewsStore = create<DoctorReviewsStore>((set) => ({
  reviewsOpen: false,
  selectedDoctor: null,
  openReviews: (doctor) =>
    set({
      selectedDoctor: doctor,
      reviewsOpen: true,
    }),
  setReviewsOpen: (open) =>
    set((state) => ({
      reviewsOpen: open,
      selectedDoctor: open ? state.selectedDoctor : null,
    })),
}));
