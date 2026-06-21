import {
  FhirClient,
  type FhirMedicationRequest,
} from '@medical-platform/domain';
import type { Prescription } from './health-record-types';
import { fhirMedicationRequestToPrescription } from './prescription-mapper';

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'mock-med-1',
    medication: 'Atorvastatin 20mg tablet',
    status: 'active',
    authoredOn: '2026-06-22',
    dosageInstructions: ['1 tablet once daily at night'],
    patientId: 'mock-patient',
  },
  {
    id: 'mock-med-2',
    medication: 'Metformin 500mg tablet',
    status: 'active',
    authoredOn: '2026-06-20',
    dosageInstructions: ['1 tablet twice daily with meals'],
    patientId: 'mock-patient',
  },
];

function byDateDesc(a: Prescription, b: Prescription): number {
  return (b.authoredOn ?? '').localeCompare(a.authoredOn ?? '');
}

/**
 * Loads the patient's prescriptions. `fhir` reads `MedicationRequest` resources
 * from the FHIR server (HAPI now, OSCAR later); otherwise an in-memory fallback.
 */
export async function loadPrescriptions(
  patientId?: string
): Promise<Prescription[]> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const client = new FhirClient({
      baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
      token: process.env.FHIR_TOKEN,
    });

    const requests = await client.search<FhirMedicationRequest>(
      'MedicationRequest',
      {
        patient: patientId ? `Patient/${patientId}` : undefined,
      }
    );

    return requests
      .map(fhirMedicationRequestToPrescription)
      .sort(byDateDesc);
  }

  const results = patientId
    ? MOCK_PRESCRIPTIONS.filter((item) => item.patientId === patientId)
    : MOCK_PRESCRIPTIONS;
  return [...results].sort(byDateDesc);
}
