// Moved from apps/web/src/features/health-records/data/{health-record-types,clinical-record-types}.ts
// (see docs/oscar/new-approach/docs-oscar-new-approach.md §1) — thin
// re-exports are left in both files so existing UI imports keep working.

export interface LabResultValue {
  /** Component label, e.g. "Systolic". Absent for single-value observations. */
  label?: string;
  /** Formatted value, e.g. "128 mmHg". */
  value: string;
}

export interface LabResult {
  id: string;
  name: string;
  status: string;
  category?: string;
  effectiveDate?: string;
  values: LabResultValue[];
  referenceRange?: string;
  interpretation?: string;
  notes?: string;
  patientId: string;
}

export interface LabResultValueDetail {
  label?: string;
  value: string;
  referenceRange?: string;
  interpretation?: string;
}

export interface LabReportSummary {
  id: string;
  code?: string;
  status?: string;
  conclusion?: string;
  issued?: string;
  performer?: string;
}

export interface LabResultDetail {
  id: string;
  name: string;
  status: string;
  category?: string;
  effectiveDate?: string;
  issued?: string;
  performer?: string;
  values: LabResultValueDetail[];
  referenceRange?: string;
  interpretation?: string;
  notes?: string;
  patientId: string;
  report?: LabReportSummary;
}

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

export interface Prescription {
  id: string;
  medication: string;
  status: string;
  authoredOn?: string;
  dosageInstructions: string[];
  repeatsAllowed?: number;
  patientId: string;
  prescriberId?: string;
}

export interface PrescriptionDispense {
  id: string;
  status?: string;
  quantity?: string;
  daysSupply?: string;
  handedOver?: string;
  pharmacy?: string;
}

export interface PrescriptionDetail {
  id: string;
  medication: string;
  status: string;
  authoredOn?: string;
  dosageInstructions: string[];
  reason?: string;
  courseOfTherapy?: string;
  prescriberName?: string;
  prescriberId?: string;
  patientId: string;
  quantity?: string;
  expectedSupplyDuration?: string;
  validityStart?: string;
  validityEnd?: string;
  repeatsAllowed?: number;
  notes?: string;
  dispenses: PrescriptionDispense[];
}

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
