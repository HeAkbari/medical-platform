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
  display?: string;
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
  type?: FhirCodeableConcept[];
  actor?: FhirReference;
  required?: 'required' | 'optional' | 'information-only';
  status?: string;
}

export interface FhirAppointment {
  resourceType: 'Appointment';
  id?: string;
  meta?: FhirMeta;
  status: FhirAppointmentStatus;
  serviceCategory?: FhirCodeableConcept[];
  serviceType?: FhirCodeableConcept[];
  specialty?: FhirCodeableConcept[];
  appointmentType?: FhirCodeableConcept;
  reasonCode?: FhirCodeableConcept[];
  priority?: number;
  description?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  created?: string;
  comment?: string;
  patientInstruction?: string;
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

export interface FhirAnnotation {
  text?: string;
}

export interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FhirObservationReferenceRange {
  low?: FhirQuantity;
  high?: FhirQuantity;
  text?: string;
}

export interface FhirObservationComponent {
  code?: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
  valueString?: string;
  interpretation?: FhirCodeableConcept[];
  referenceRange?: FhirObservationReferenceRange[];
}

export type FhirObservationStatus =
  | 'registered'
  | 'preliminary'
  | 'final'
  | 'amended'
  | 'corrected'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown';

export interface FhirObservation {
  resourceType: 'Observation';
  id?: string;
  meta?: FhirMeta;
  status?: FhirObservationStatus;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  encounter?: FhirReference;
  performer?: FhirReference[];
  effectiveDateTime?: string;
  issued?: string;
  valueQuantity?: FhirQuantity;
  valueString?: string;
  interpretation?: FhirCodeableConcept[];
  referenceRange?: FhirObservationReferenceRange[];
  component?: FhirObservationComponent[];
  note?: FhirAnnotation[];
}

export type FhirDiagnosticReportStatus =
  | 'registered'
  | 'partial'
  | 'preliminary'
  | 'final'
  | 'amended'
  | 'corrected'
  | 'appended'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown';

export interface FhirDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id?: string;
  meta?: FhirMeta;
  status?: FhirDiagnosticReportStatus;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  performer?: FhirReference[];
  effectiveDateTime?: string;
  issued?: string;
  result?: FhirReference[];
  conclusion?: string;
  conclusionCode?: FhirCodeableConcept[];
}

export interface FhirDosage {
  text?: string;
  patientInstruction?: string;
}

export interface FhirMedicationRequestDispenseRequest {
  numberOfRepeatsAllowed?: number;
  quantity?: FhirQuantity;
  expectedSupplyDuration?: FhirQuantity;
  validityPeriod?: { start?: string; end?: string };
}

export type FhirMedicationRequestStatus =
  | 'active'
  | 'on-hold'
  | 'cancelled'
  | 'completed'
  | 'entered-in-error'
  | 'stopped'
  | 'draft'
  | 'unknown';

export interface FhirMedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  meta?: FhirMeta;
  status?: FhirMedicationRequestStatus;
  intent?: string;
  medicationCodeableConcept?: FhirCodeableConcept;
  subject?: FhirReference;
  requester?: FhirReference;
  authoredOn?: string;
  courseOfTherapyType?: FhirCodeableConcept;
  reasonCode?: FhirCodeableConcept[];
  dosageInstruction?: FhirDosage[];
  dispenseRequest?: FhirMedicationRequestDispenseRequest;
  note?: FhirAnnotation[];
}

export type FhirMedicationDispenseStatus =
  | 'preparation'
  | 'in-progress'
  | 'cancelled'
  | 'on-hold'
  | 'completed'
  | 'entered-in-error'
  | 'stopped'
  | 'declined'
  | 'unknown';

export interface FhirMedicationDispensePerformer {
  actor?: FhirReference;
}

export interface FhirMedicationDispense {
  resourceType: 'MedicationDispense';
  id?: string;
  meta?: FhirMeta;
  status?: FhirMedicationDispenseStatus;
  medicationCodeableConcept?: FhirCodeableConcept;
  subject?: FhirReference;
  authorizingPrescription?: FhirReference[];
  quantity?: FhirQuantity;
  daysSupply?: FhirQuantity;
  whenPrepared?: string;
  whenHandedOver?: string;
  performer?: FhirMedicationDispensePerformer[];
}

export interface FhirImmunizationPerformer {
  function?: FhirCodeableConcept;
  actor?: FhirReference;
}

export interface FhirImmunizationProtocolApplied {
  series?: string;
  targetDisease?: FhirCodeableConcept[];
  doseNumberPositiveInt?: number;
  doseNumberString?: string;
  seriesDosesPositiveInt?: number;
}

export type FhirImmunizationStatus = 'completed' | 'entered-in-error' | 'not-done';

export interface FhirImmunization {
  resourceType: 'Immunization';
  id?: string;
  meta?: FhirMeta;
  status?: FhirImmunizationStatus;
  vaccineCode?: FhirCodeableConcept;
  patient?: FhirReference;
  occurrenceDateTime?: string;
  primarySource?: boolean;
  manufacturer?: FhirReference;
  lotNumber?: string;
  expirationDate?: string;
  site?: FhirCodeableConcept;
  route?: FhirCodeableConcept;
  doseQuantity?: FhirQuantity;
  performer?: FhirImmunizationPerformer[];
  protocolApplied?: FhirImmunizationProtocolApplied[];
  note?: FhirAnnotation[];
}

export interface FhirCondition {
  resourceType: 'Condition';
  id?: string;
  meta?: FhirMeta;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  severity?: FhirCodeableConcept;
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  note?: FhirAnnotation[];
}

export interface FhirAllergyReaction {
  substance?: FhirCodeableConcept;
  manifestation?: FhirCodeableConcept[];
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface FhirAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  meta?: FhirMeta;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: string[];
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: FhirCodeableConcept;
  patient?: FhirReference;
  onsetDateTime?: string;
  recordedDate?: string;
  reaction?: FhirAllergyReaction[];
  note?: FhirAnnotation[];
}

export interface FhirAttachment {
  contentType?: string;
  url?: string;
  title?: string;
  creation?: string;
  size?: number;
}

export interface FhirDocumentReferenceContent {
  attachment?: FhirAttachment;
}

export interface FhirDocumentReference {
  resourceType: 'DocumentReference';
  id?: string;
  meta?: FhirMeta;
  status?: 'current' | 'superseded' | 'entered-in-error';
  docStatus?: string;
  type?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  subject?: FhirReference;
  date?: string;
  author?: FhirReference[];
  custodian?: FhirReference;
  description?: string;
  content?: FhirDocumentReferenceContent[];
}

export type FhirResource =
  | FhirPatient
  | FhirPractitioner
  | FhirAppointment
  | FhirLocation
  | FhirOrganization
  | FhirHealthcareService
  | FhirPractitionerRole
  | FhirObservation
  | FhirMedicationRequest
  | FhirDiagnosticReport
  | FhirMedicationDispense
  | FhirImmunization
  | FhirCondition
  | FhirAllergyIntolerance
  | FhirDocumentReference;

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
