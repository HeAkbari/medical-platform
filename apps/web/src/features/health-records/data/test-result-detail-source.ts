import { repositories } from '@/lib/repositories';
import type { LabResultDetail } from './health-record-types';

/** Delegates entirely to the active TestResultRepository (mock/fhir/oscar). */
export async function loadTestResultDetail(id: string): Promise<LabResultDetail | null> {
  return repositories.testResults.findById(id);
}
