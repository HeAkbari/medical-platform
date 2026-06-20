/**
 * Minimal FHIR R4 type definitions — only the fields this adapter reads or writes.
 * Full FHIR resources are large; we model the subset the platform actually uses.
 */

export interface FhirHumanName {
  family?: string;
  given?: string[];
  prefix?: string[];
}

export interface FhirContactPoint {
  system?: 'phone' | 'email' | 'fax' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
}

export interface FhirReference {
  reference?: string; // e.g. "Patient/1000"
}

export interface FhirMeta {
  lastUpdated?: string;
}

export interface FhirPatient {
  resourceType: 'Patient';
  id?: string;
  meta?: FhirMeta;
  name?: FhirHumanName[];
  birthDate?: string;
  telecom?: FhirContactPoint[];
  gender?: string;
}

export interface FhirPractitionerQualification {
  code?: { text?: string };
}

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: FhirMeta;
  name?: FhirHumanName[];
  telecom?: FhirContactPoint[];
  qualification?: FhirPractitionerQualification[];
}

export type FhirAppointmentStatus =
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

export interface FhirAppointmentParticipant {
  actor?: FhirReference;
  status?: string;
}

export interface FhirAppointment {
  resourceType: 'Appointment';
  id?: string;
  meta?: FhirMeta;
  status: FhirAppointmentStatus;
  description?: string;
  start?: string;
  end?: string;
  comment?: string;
  participant?: FhirAppointmentParticipant[];
}

export type FhirResource = FhirPatient | FhirPractitioner | FhirAppointment;

export interface FhirBundleEntry<T> {
  fullUrl?: string;
  resource?: T;
}

export interface FhirBundle<T> {
  resourceType: 'Bundle';
  type?: string;
  total?: number;
  entry?: FhirBundleEntry<T>[];
}
