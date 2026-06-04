import { create } from 'zustand';

/** Legacy type for unused doctor-reviews feature (pre facility-centric map). */
export interface ReviewDoctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  profileImageUrl: string;
  rating: number;
  reviewCount: number;
}

interface DoctorReviewsStore {
  reviewsOpen: boolean;
  selectedDoctor: ReviewDoctor | null;
  openReviews: (doctor: ReviewDoctor) => void;
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
