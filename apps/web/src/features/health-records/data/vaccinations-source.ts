import { repositories } from '@/lib/repositories';
import type { Vaccination, VaccinationDetail } from './clinical-record-types';

/** Delegates entirely to the active ImmunizationRepository (mock/fhir/oscar). */
export async function loadVaccinations(patientId?: string): Promise<Vaccination[]> {
  return repositories.immunizations.findAll(patientId);
}

export async function loadVaccinationDetail(id: string): Promise<VaccinationDetail | null> {
  return repositories.immunizations.findById(id);
}
