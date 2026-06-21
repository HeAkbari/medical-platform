/**
 * FHIR-native view models for the patient's clinical records.
 *
 * - `LabResult`     ← FHIR `Observation`        (Test results service)
 * - `Prescription`  ← FHIR `MedicationRequest`  (Prescriptions service)
 *
 * Like the map's `FacilityDetail`, these are display shapes built directly from
 * FHIR resources. The data model is intentionally thin and will be revisited
 * when OSCAR Pro is connected.
 */

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

// --- Detail shapes (drawer) ----------------------------------------------

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
