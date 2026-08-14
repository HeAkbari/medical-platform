import { repositories } from '@/lib/repositories';
import type {
  HealthRecordDetail,
  HealthRecordEntry,
  HealthRecordKind,
} from './clinical-record-types';

/** Delegates entirely to the active HealthConditionRepository (mock/fhir/oscar). */
export async function loadHealthRecords(patientId?: string): Promise<HealthRecordEntry[]> {
  return repositories.healthConditions.findAll(patientId);
}

export async function loadHealthRecordDetail(
  id: string,
  kind: HealthRecordKind
): Promise<HealthRecordDetail | null> {
  return repositories.healthConditions.findById(id, kind);
}
