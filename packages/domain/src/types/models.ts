export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
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
}

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

export interface ApiError {
  message: string;
  code: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}
