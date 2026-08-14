import { repositories } from '@/lib/repositories';
import type { Prescription } from './health-record-types';

/** Delegates entirely to the active PrescriptionRepository (mock/fhir/oscar). */
export async function loadPrescriptions(patientId?: string): Promise<Prescription[]> {
  return repositories.prescriptions.findAll(patientId);
}
