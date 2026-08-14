import { repositories } from '@/lib/repositories';
import type { LabResult } from './health-record-types';

/** Delegates entirely to the active TestResultRepository (mock/fhir/oscar). */
export async function loadTestResults(patientId?: string): Promise<LabResult[]> {
  return repositories.testResults.findAll(patientId);
}
