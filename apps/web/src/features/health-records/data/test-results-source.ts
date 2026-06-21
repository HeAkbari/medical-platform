import { FhirClient, type FhirObservation } from '@medical-platform/domain';
import type { LabResult } from './health-record-types';
import { fhirObservationToLabResult } from './observation-mapper';

const MOCK_LAB_RESULTS: LabResult[] = [
  {
    id: 'mock-obs-1',
    name: 'Blood pressure',
    status: 'final',
    effectiveDate: '2026-06-22T10:05:00-04:00',
    values: [
      { label: 'Systolic', value: '128 mmHg' },
      { label: 'Diastolic', value: '82 mmHg' },
    ],
    patientId: 'mock-patient',
  },
  {
    id: 'mock-obs-2',
    name: 'Blood glucose',
    status: 'final',
    effectiveDate: '2026-06-20T09:00:00-04:00',
    values: [{ value: '142 mg/dL' }],
    patientId: 'mock-patient',
  },
];

function byDateDesc(a: LabResult, b: LabResult): number {
  return (b.effectiveDate ?? '').localeCompare(a.effectiveDate ?? '');
}

/**
 * Loads the patient's lab/observation results. `fhir` reads `Observation`
 * resources from the FHIR server (HAPI now, OSCAR later); otherwise a small
 * in-memory fallback is returned.
 */
export async function loadTestResults(patientId?: string): Promise<LabResult[]> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const client = new FhirClient({
      baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
      token: process.env.FHIR_TOKEN,
    });

    const observations = await client.search<FhirObservation>('Observation', {
      patient: patientId ? `Patient/${patientId}` : undefined,
    });

    return observations.map(fhirObservationToLabResult).sort(byDateDesc);
  }

  const results = patientId
    ? MOCK_LAB_RESULTS.filter((item) => item.patientId === patientId)
    : MOCK_LAB_RESULTS;
  return [...results].sort(byDateDesc);
}
