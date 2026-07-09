export interface PhysicianWorkingHours {
  day: string;
  hours: string | null;
}

export interface PhysicianReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface PhysicianExtras {
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  clinicName: string;
  clinicAddress: string;
  languages: string[];
  workingHours: PhysicianWorkingHours[];
  reviews: PhysicianReview[];
}

export const DEFAULT_PHYSICIAN_EXTRAS: PhysicianExtras = {
  rating: 4.7,
  reviewCount: 128,
  yearsOfExperience: 12,
  clinicName: 'Pacific Primary Care Clinic',
  clinicAddress: '1234 Oak Street, Victoria, BC V8W 2A1',
  languages: ['English', 'French'],
  workingHours: [
    { day: 'Monday', hours: '9:00 AM – 5:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM – 5:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM – 1:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 5:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 4:00 PM' },
    { day: 'Saturday', hours: null },
    { day: 'Sunday', hours: null },
  ],
  reviews: [
    {
      id: 'r1',
      authorName: 'Sarah K.',
      rating: 5,
      comment: 'Very attentive and took the time to explain everything clearly. Highly recommend.',
      date: '2026-06-10',
    },
    {
      id: 'r2',
      authorName: 'James T.',
      rating: 4,
      comment: 'Good experience overall. Wait time was a bit long but the appointment itself was thorough.',
      date: '2026-05-22',
    },
    {
      id: 'r3',
      authorName: 'Priya M.',
      rating: 5,
      comment: 'Excellent bedside manner. Made me feel comfortable and addressed all my concerns.',
      date: '2026-04-15',
    },
  ],
};
