import type { AppointmentStatus } from '@medical-platform/domain';

/**
 * FHIR-native appointment detail. Aggregates the `Appointment` with the
 * resolved `Practitioner` (specialty, contact) and `Location` (address, contact)
 * so the detail drawer can show the full "who / where / what / when".
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
