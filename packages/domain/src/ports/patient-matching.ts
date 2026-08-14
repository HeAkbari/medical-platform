/**
 * Distinguishes "no matching record" from operational failures — a caller
 * needs to tell a patient "no record found, contact your clinic" very
 * differently from "the clinic's system is unreachable, try again later".
 */
export type PatientMatchResult =
  | { status: 'matched'; externalPatientId: string }
  | { status: 'not_found' }
  | { status: 'invalid_data' }
  | { status: 'unavailable' };

export interface PatientMatchInput {
  clinicId: string;
  healthNumber: string;
  dateOfBirth: string;
}

/**
 * Matches a platform patient against a clinic's EMR using identifiers the
 * patient provides (HIN + DOB for OSCAR) — never phone number, which OSCAR's
 * search endpoints don't reliably match on. Implementations must never log
 * `healthNumber` (see docs/oscar/new-approach/patient-clinic-linking-architecture.md).
 */
export interface ClinicPatientMatcher {
  matchPatient(input: PatientMatchInput): Promise<PatientMatchResult>;
}
