/**
 * View models for the patient's clinical records — moved to
 * packages/domain/src/types/health-records.ts (see
 * docs/oscar/new-approach/docs-oscar-new-approach.md §1); re-exported here
 * so existing imports keep working.
 */
export type {
  LabReportSummary,
  LabResult,
  LabResultDetail,
  LabResultValue,
  LabResultValueDetail,
  Prescription,
  PrescriptionDetail,
  PrescriptionDispense,
} from '@medical-platform/domain';
