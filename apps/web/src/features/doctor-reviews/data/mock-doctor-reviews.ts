import type { DoctorReview } from '@/features/doctor-reviews/types';

export const MOCK_DOCTOR_REVIEWS: DoctorReview[] = [
  {
    id: 'rev-emily-1',
    doctorId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    authorName: 'John Carter',
    rating: 5,
    comment:
      'Dr. Nguyen listened carefully and explained everything in simple terms. Wait time was short and the clinic was very clean.',
    createdAt: '2026-04-18T14:20:00.000Z',
  },
  {
    id: 'rev-emily-2',
    doctorId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    authorName: 'Laura Bennett',
    rating: 5,
    comment:
      'Excellent general practitioner. She followed up the next day to check on my recovery.',
    createdAt: '2026-03-02T09:15:00.000Z',
  },
  {
    id: 'rev-emily-3',
    doctorId: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    authorName: 'Mark Hughes',
    rating: 4,
    comment:
      'Very professional visit. Parking was a bit difficult, but the care itself was outstanding.',
    createdAt: '2026-01-21T16:40:00.000Z',
  },
  {
    id: 'rev-david-1',
    doctorId: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    authorName: 'Susan Reed',
    rating: 5,
    comment:
      'Dr. Brooks reviewed my test results thoroughly and adjusted my treatment plan right away.',
    createdAt: '2026-04-10T11:05:00.000Z',
  },
  {
    id: 'rev-david-2',
    doctorId: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    authorName: 'Alan Price',
    rating: 4,
    comment:
      'Knowledgeable cardiologist with a calm bedside manner. Appointment ran slightly late.',
    createdAt: '2026-02-14T13:30:00.000Z',
  },
  {
    id: 'rev-david-3',
    doctorId: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
    authorName: 'Helen Morris',
    rating: 5,
    comment:
      'Felt reassured after my consultation. Clear instructions and helpful staff.',
    createdAt: '2025-12-08T10:00:00.000Z',
  },
  {
    id: 'rev-sarah-1',
    doctorId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    authorName: 'Rachel Adams',
    rating: 5,
    comment:
      'Our kids always feel comfortable with Dr. Kim. She is patient, kind, and very thorough.',
    createdAt: '2026-05-01T08:45:00.000Z',
  },
  {
    id: 'rev-sarah-2',
    doctorId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    authorName: 'Daniel Cooper',
    rating: 5,
    comment:
      'Best pediatrician we have visited. Great with toddlers and excellent communication with parents.',
    createdAt: '2026-03-19T15:10:00.000Z',
  },
  {
    id: 'rev-sarah-3',
    doctorId: 'f6a7b8c9-d0e1-2345-f012-456789012345',
    authorName: 'Emma Walsh',
    rating: 5,
    comment:
      'Quick diagnosis and thoughtful advice. The office team was friendly and organized.',
    createdAt: '2026-01-05T12:25:00.000Z',
  },
  {
    id: 'rev-james-1',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    authorName: 'Olivia Grant',
    rating: 4,
    comment:
      'Dr. Wilson helped clear up my skin issue within two weeks. Would recommend.',
    createdAt: '2026-04-22T17:00:00.000Z',
  },
  {
    id: 'rev-james-2',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    authorName: 'Peter Shaw',
    rating: 5,
    comment:
      'Clear treatment plan and realistic expectations. Very happy with the results.',
    createdAt: '2026-02-28T09:50:00.000Z',
  },
  {
    id: 'rev-james-3',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    authorName: 'Nina Brooks',
    rating: 4,
    comment: 'Professional and efficient. The follow-up appointment was easy to book.',
    createdAt: '2025-11-16T14:15:00.000Z',
  },
  {
    id: 'rev-maria-1',
    doctorId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    authorName: 'Chris Turner',
    rating: 5,
    comment:
      'Dr. Garcia explained my knee injury clearly and helped me recover faster than expected.',
    createdAt: '2026-04-05T10:35:00.000Z',
  },
  {
    id: 'rev-maria-2',
    doctorId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    authorName: 'Julia Stone',
    rating: 4,
    comment:
      'Strong orthopedic expertise and practical rehab advice. Reception was a little busy.',
    createdAt: '2026-01-30T13:05:00.000Z',
  },
  {
    id: 'rev-maria-3',
    doctorId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    authorName: 'Kevin Lane',
    rating: 5,
    comment:
      'Excellent surgeon and communicator. I felt supported throughout recovery.',
    createdAt: '2025-10-12T11:20:00.000Z',
  },
  {
    id: 'rev-robert-1',
    doctorId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    authorName: 'Sophie Reid',
    rating: 4,
    comment:
      'Friendly doctor with a practical approach. Helped me manage my symptoms quickly.',
    createdAt: '2026-03-11T08:20:00.000Z',
  },
  {
    id: 'rev-robert-2',
    doctorId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    authorName: 'Tom Baker',
    rating: 4,
    comment:
      'Good experience overall. Dr. Chen took time to answer all my questions.',
    createdAt: '2026-01-17T16:55:00.000Z',
  },
  {
    id: 'rev-robert-3',
    doctorId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    authorName: 'Grace Hill',
    rating: 4,
    comment: 'Reliable GP for routine checkups. Online booking worked smoothly.',
    createdAt: '2025-12-22T09:40:00.000Z',
  },
  {
    id: 'rev-lisa-1',
    doctorId: 'd4e5f6a7-b8c9-0123-def0-234567890124',
    authorName: 'Henry Clark',
    rating: 5,
    comment:
      'Dr. Patel is outstanding. She identified an issue others missed and acted quickly.',
    createdAt: '2026-05-03T12:10:00.000Z',
  },
  {
    id: 'rev-lisa-2',
    doctorId: 'd4e5f6a7-b8c9-0123-def0-234567890124',
    authorName: 'Isabella Ford',
    rating: 5,
    comment:
      'Compassionate and highly skilled. I trust her completely with my care.',
    createdAt: '2026-03-27T15:45:00.000Z',
  },
  {
    id: 'rev-lisa-3',
    doctorId: 'd4e5f6a7-b8c9-0123-def0-234567890124',
    authorName: 'Noah Perry',
    rating: 5,
    comment:
      'One of the best specialists I have seen. Clear explanations and excellent follow-up.',
    createdAt: '2026-02-03T10:05:00.000Z',
  },
  {
    id: 'rev-michael-1',
    doctorId: 'e5f6a7b8-c9d0-1234-ef01-345678901235',
    authorName: 'Chloe Ward',
    rating: 4,
    comment:
      'Helpful consultation for a persistent rash. Treatment worked well.',
    createdAt: '2026-04-14T09:30:00.000Z',
  },
  {
    id: 'rev-michael-2',
    doctorId: 'e5f6a7b8-c9d0-1234-ef01-345678901235',
    authorName: 'Ethan Gray',
    rating: 4,
    comment:
      'Professional and direct. Would have liked a slightly longer appointment.',
    createdAt: '2026-01-09T14:00:00.000Z',
  },
  {
    id: 'rev-michael-3',
    doctorId: 'e5f6a7b8-c9d0-1234-ef01-345678901235',
    authorName: 'Mia Collins',
    rating: 4,
    comment: 'Good dermatology care and reasonable wait times.',
    createdAt: '2025-11-28T11:15:00.000Z',
  },
  {
    id: 'rev-anna-1',
    doctorId: 'f6a7b8c9-d0e1-2345-f012-456789012346',
    authorName: 'Ben Foster',
    rating: 5,
    comment:
      'Dr. Schmidt is wonderful with children and always makes parents feel informed.',
    createdAt: '2026-04-28T13:20:00.000Z',
  },
  {
    id: 'rev-anna-2',
    doctorId: 'f6a7b8c9-d0e1-2345-f012-456789012346',
    authorName: 'Lily Morgan',
    rating: 4,
    comment:
      'Very caring pediatrician. The clinic could use a few more evening slots.',
    createdAt: '2026-02-19T08:55:00.000Z',
  },
  {
    id: 'rev-anna-3',
    doctorId: 'f6a7b8c9-d0e1-2345-f012-456789012346',
    authorName: 'Jack Sullivan',
    rating: 5,
    comment:
      'Excellent advice for our newborn checkup. Warm and reassuring visit.',
    createdAt: '2025-12-30T16:30:00.000Z',
  },
  {
    id: 'rev-thomas-1',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    authorName: 'Ava Richardson',
    rating: 4,
    comment:
      'Dr. Wright helped me understand my shoulder pain and created a solid rehab plan.',
    createdAt: '2026-03-06T10:15:00.000Z',
  },
  {
    id: 'rev-thomas-2',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    authorName: 'Ryan Powell',
    rating: 4,
    comment:
      'Professional and knowledgeable. Recovery instructions were easy to follow.',
    createdAt: '2026-01-24T12:40:00.000Z',
  },
  {
    id: 'rev-thomas-3',
    doctorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
    authorName: 'Zoe Mitchell',
    rating: 4,
    comment: 'Good orthopedic care. Staff were helpful with insurance questions.',
    createdAt: '2025-10-30T09:05:00.000Z',
  },
];

export function getDoctorReviews(doctorId: string): DoctorReview[] {
  return MOCK_DOCTOR_REVIEWS.filter((review) => review.doctorId === doctorId).sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
