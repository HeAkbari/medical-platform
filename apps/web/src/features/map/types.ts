import { DOCTOR_SPECIALTIES } from './constants';

export type DoctorSpecialty = (typeof DOCTOR_SPECIALTIES)[number];

export interface MapDoctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: DoctorSpecialty;
  email: string;
  phone: string;
  profileImageUrl: string;
  position: [number, number];
  availableToday: boolean;
  rating: number;
  reviewCount: number;
}

export interface MapDoctorFilters {
  selectedSpecialties: DoctorSpecialty[];
  maxDistanceKm: number;
  availableTodayOnly: boolean;
}

export interface MapRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export type MapNavigationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DoctorReview {
  id: string;
  doctorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
