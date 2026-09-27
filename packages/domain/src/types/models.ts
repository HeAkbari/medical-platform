export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  // Only firstName/lastName are guaranteed at registration — everything
  // else is completed later from the profile page.
  dateOfBirth: string | null;
  email: string | null;
  phone: string;
  healthNumber: string | null;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  createdAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  createdAt: string;
  // FHIR-derived enrichment (optional; populated from the practitioner's
  // PractitionerRole -> Location, or the mock dataset).
  clinicName?: string;
  // Platform-owned rating (optional; populated by the Doctor directory read
  // model — see docs/oscar/new-approach/docs-oscar-new-approach.md §5).
  // Undefined until the directory is synced/has reviews, not 0 — 0 would
  // read as "rated zero stars" rather than "not yet rated".
  averageRating?: number;
  reviewCount?: number;
  // Individual reviews (id-lookup only, see PrismaDoctorDirectoryRepository
  // .findById — omitted from findAll to keep the list payload light).
  // Empty until a real review-submission path exists; that's an honest
  // "no reviews yet", not a bug.
  reviews?: DoctorReview[];
  // Denormalized from the linked Facility row (see docs-oscar-new-approach.md
  // §5/deferred-items.md #1) — undefined until that clinic's Facility row is
  // linked via clinicId.
  clinicAddress?: DoctorClinicAddress;
  workingHours?: DoctorWorkingHours;
  languages?: string[];
}

export interface DoctorReview {
  rating: number;
  comment?: string;
  authorName?: string;
  createdAt: string;
}

export interface DoctorClinicAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export type DoctorWorkingHours =
  | { monday: string; tuesday: string; wednesday: string; thursday: string; friday: string; saturday: string; sunday: string }
  | '24/7';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

/**
 * Raw FHIR Appointment.status — preserved alongside the coarse `status` so the
 * UI can show the precise lifecycle state (e.g. booked vs arrived vs noshow).
 */
export type FhirAppointmentStatusValue =
  | 'proposed'
  | 'pending'
  | 'booked'
  | 'arrived'
  | 'fulfilled'
  | 'cancelled'
  | 'noshow'
  | 'entered-in-error'
  | 'checked-in'
  | 'waitlist';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  createdAt: string;
  // FHIR-derived enrichment (optional; populated by the FHIR adapter).
  fhirStatus?: FhirAppointmentStatusValue;
  patientName?: string;
  doctorName?: string;
  serviceCategory?: string;
  serviceType?: string;
  specialty?: string;
  appointmentType?: string;
  priority?: string;
  reasonText?: string;
  locationId?: string;
  locationName?: string;
}

/**
 * Aggregates an Appointment with its resolved doctor/location so the detail
 * drawer can show the full "who / where / what / when" — moved here from
 * apps/web/src/features/appointments/data/appointment-detail.ts (§1 of
 * docs/oscar/new-approach/docs-oscar-new-approach.md); a thin re-export is
 * left there so existing UI imports keep working.
 */
export interface AppointmentDoctorDetail {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
}

export interface AppointmentLocationDetail {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface AppointmentDetail {
  id: string;
  status: AppointmentStatus;
  fhirStatus?: string;
  scheduledAt: string;
  endAt?: string;
  durationMinutes: number;
  serviceCategory?: string;
  serviceType?: string;
  specialty?: string;
  appointmentType?: string;
  priority?: string;
  reason: string;
  reasonText?: string;
  comment?: string;
  patientInstruction?: string;
  created?: string;
  patientName?: string;
  doctor?: AppointmentDoctorDetail;
  location?: AppointmentLocationDetail;
}

export interface ApiError {
  message: string;
  code: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}
