/**
 * View models for the remaining clinical record services — moved to
 * packages/domain/src/types/health-records.ts (see
 * docs/oscar/new-approach/docs-oscar-new-approach.md §1); re-exported here
 * so existing imports keep working.
 */
export type {
  AllergyDetail,
  AllergyReactionDetail,
  ConditionDetail,
  DocumentDetail,
  DocumentRecord,
  HealthRecordDetail,
  HealthRecordEntry,
  HealthRecordKind,
  Vaccination,
  VaccinationDetail,
} from '@medical-platform/domain';
