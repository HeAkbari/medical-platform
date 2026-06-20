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

export interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirAddress {
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FhirLocationPosition {
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

export interface FhirLocationHoursOfOperation {
  daysOfWeek?: string[]; // mon | tue | wed | thu | fri | sat | sun
  allDay?: boolean;
  openingTime?: string; // HH:mm:ss
  closingTime?: string; // HH:mm:ss
}

export interface FhirLocation {
  resourceType: 'Location';
  id?: string;
  meta?: FhirMeta;
  status?: string;
  name?: string;
  type?: FhirCodeableConcept[];
  telecom?: FhirContactPoint[];
  address?: FhirAddress;
  position?: FhirLocationPosition;
  hoursOfOperation?: FhirLocationHoursOfOperation[];
}

export interface FhirOrganization {
  resourceType: 'Organization';
  id?: string;
  meta?: FhirMeta;
  name?: string;
  alias?: string[];
  type?: FhirCodeableConcept[];
  telecom?: FhirContactPoint[];
  address?: FhirAddress[];
}

export interface FhirAvailableTime {
  daysOfWeek?: string[];
  allDay?: boolean;
  availableStartTime?: string;
  availableEndTime?: string;
}

export interface FhirHealthcareServiceEligibility {
  code?: FhirCodeableConcept;
  comment?: string;
}

export interface FhirHealthcareService {
  resourceType: 'HealthcareService';
  id?: string;
  meta?: FhirMeta;
  active?: boolean;
  providedBy?: FhirReference;
  location?: FhirReference[];
  name?: string;
  comment?: string;
  extraDetails?: string;
  category?: FhirCodeableConcept[];
  type?: FhirCodeableConcept[];
  specialty?: FhirCodeableConcept[];
  appointmentRequired?: boolean;
  referralMethod?: FhirCodeableConcept[];
  eligibility?: FhirHealthcareServiceEligibility[];
  program?: FhirCodeableConcept[];
  communication?: FhirCodeableConcept[];
  availableTime?: FhirAvailableTime[];
}

export interface FhirPractitionerRole {
  resourceType: 'PractitionerRole';
  id?: string;
  meta?: FhirMeta;
  practitioner?: FhirReference;
  organization?: FhirReference;
  location?: FhirReference[];
  code?: FhirCodeableConcept[];
  specialty?: FhirCodeableConcept[];
  availableTime?: FhirAvailableTime[];
}

export type FhirResource =
  | FhirPatient
  | FhirPractitioner
  | FhirAppointment
  | FhirLocation
  | FhirOrganization
  | FhirHealthcareService
  | FhirPractitionerRole;

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
