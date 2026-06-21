/**
 * FHIR-native view models for the remaining clinical record services:
 *   - Vaccinations     ← FHIR `Immunization`
 *   - Health conditions ← FHIR `Condition` + `AllergyIntolerance`
 *   - Documents        ← FHIR `DocumentReference`
 */

// --- Vaccinations ---------------------------------------------------------

export interface Vaccination {
  id: string;
  name: string;
  status: string;
  date?: string;
  doseNumber?: number;
  seriesDoses?: number;
  patientId: string;
}

export interface VaccinationDetail extends Vaccination {
  manufacturer?: string;
  lotNumber?: string;
  expirationDate?: string;
  site?: string;
  route?: string;
  doseQuantity?: string;
  performer?: string;
  targetDiseases: string[];
  notes?: string;
}

// --- Health conditions (Condition + AllergyIntolerance) -------------------

export type HealthRecordKind = 'condition' | 'allergy';

export interface HealthRecordEntry {
  id: string;
  kind: HealthRecordKind;
  name: string;
  clinicalStatus?: string;
  /** Condition severity or allergy criticality, surfaced as a single chip. */
  tag?: string;
  recordedDate?: string;
  patientId: string;
}

export interface ConditionDetail {
  id: string;
  kind: 'condition';
  name: string;
  clinicalStatus?: string;
  verificationStatus?: string;
  category?: string;
  severity?: string;
  onsetDate?: string;
  recordedDate?: string;
  notes?: string;
  patientId: string;
}

export interface AllergyReactionDetail {
  manifestations: string[];
  severity?: string;
  description?: string;
}

export interface AllergyDetail {
  id: string;
  kind: 'allergy';
  name: string;
  type?: string;
  categories: string[];
  criticality?: string;
  clinicalStatus?: string;
  verificationStatus?: string;
  onsetDate?: string;
  recordedDate?: string;
  reactions: AllergyReactionDetail[];
  notes?: string;
  patientId: string;
}

export type HealthRecordDetail = ConditionDetail | AllergyDetail;

// --- Documents ------------------------------------------------------------

export interface DocumentRecord {
  id: string;
  title: string;
  type?: string;
  date?: string;
  patientId: string;
}

export interface DocumentDetail extends DocumentRecord {
  status?: string;
  docStatus?: string;
  category?: string;
  author?: string;
  custodian?: string;
  description?: string;
  contentType?: string;
  fileTitle?: string;
  fileSize?: string;
  fileUrl?: string;
}
