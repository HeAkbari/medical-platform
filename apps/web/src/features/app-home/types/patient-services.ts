export type PrescriptionStatus =
  | 'active'
  | 'processing'
  | 'ready'
  | 'expired'
  | 'needs-review';

export interface MockPrescription {
  id: string;
  medication: string;
  dosage: string;
  prescribedBy: string;
  pharmacy: string;
  status: PrescriptionStatus;
  lastIssuedAt: string;
  repeatsRemaining: number;
  nextOrderEligibleAt?: string;
  instructions: string;
}

export type TestResultStatus = 'available' | 'pending' | 'abnormal';

export type TestResultFlag = 'normal' | 'high' | 'low' | 'review';

export interface MockTestResult {
  id: string;
  testName: string;
  orderedBy: string;
  facility: string;
  sampleDate: string;
  resultDate?: string;
  status: TestResultStatus;
  summary?: string;
  flag?: TestResultFlag;
}

export type ConditionStatus = 'active' | 'resolved' | 'monitored';

export interface MockHealthCondition {
  id: string;
  name: string;
  status: ConditionStatus;
  diagnosedAt: string;
  recordedBy: string;
  notes: string;
}

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export interface MockAllergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  recordedAt: string;
}

export interface MockMedicineReaction {
  id: string;
  medicine: string;
  reaction: string;
  recordedAt: string;
}

export type VaccinationStatus = 'completed' | 'due' | 'overdue' | 'scheduled';

export interface MockVaccination {
  id: string;
  vaccine: string;
  date?: string;
  provider: string;
  status: VaccinationStatus;
  dueDate?: string;
  doseLabel?: string;
}

export type HealthDocumentType =
  | 'letter'
  | 'sick-note'
  | 'referral'
  | 'lab-requisition'
  | 'discharge'
  | 'other';

export interface MockHealthDocument {
  id: string;
  title: string;
  type: HealthDocumentType;
  from: string;
  date: string;
  summary: string;
}
