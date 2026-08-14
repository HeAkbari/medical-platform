import { repositories } from '@/lib/repositories';
import type { PrescriptionDetail } from './health-record-types';

/** Delegates entirely to the active PrescriptionRepository (mock/fhir/oscar). */
export async function loadPrescriptionDetail(id: string): Promise<PrescriptionDetail | null> {
  return repositories.prescriptions.findById(id);
}
