import {
  FhirClient,
  type FhirAllergyIntolerance,
  type FhirCondition,
} from '@medical-platform/domain';
import type {
  HealthRecordDetail,
  HealthRecordEntry,
  HealthRecordKind,
} from './clinical-record-types';
import {
  fhirAllergyToDetail,
  fhirAllergyToEntry,
  fhirConditionToDetail,
  fhirConditionToEntry,
} from './condition-allergy-mapper';

function client(): FhirClient {
  return new FhirClient({
    baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
    token: process.env.FHIR_TOKEN,
  });
}

function byDateDesc(a: HealthRecordEntry, b: HealthRecordEntry): number {
  return (b.recordedDate ?? '').localeCompare(a.recordedDate ?? '');
}

const MOCK_ENTRIES: HealthRecordEntry[] = [
  {
    id: 'mock-cond-1',
    kind: 'condition',
    name: 'Essential hypertension',
    clinicalStatus: 'Active',
    tag: 'Moderate',
    recordedDate: '2023-02-15',
    patientId: 'mock-patient',
  },
  {
    id: 'mock-allergy-1',
    kind: 'allergy',
    name: 'Penicillin',
    clinicalStatus: 'Active',
    tag: 'high risk',
    recordedDate: '2015-06-03',
    patientId: 'mock-patient',
  },
];

export async function loadHealthRecords(
  patientId?: string
): Promise<HealthRecordEntry[]> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const fhir = client();
    const patientFilter = patientId ? `Patient/${patientId}` : undefined;

    const [conditions, allergies] = await Promise.all([
      fhir.search<FhirCondition>('Condition', { patient: patientFilter }),
      fhir.search<FhirAllergyIntolerance>('AllergyIntolerance', {
        patient: patientFilter,
      }),
    ]);

    return [
      ...conditions.map(fhirConditionToEntry),
      ...allergies.map(fhirAllergyToEntry),
    ].sort(byDateDesc);
  }

  return [...MOCK_ENTRIES].sort(byDateDesc);
}

export async function loadHealthRecordDetail(
  id: string,
  kind: HealthRecordKind
): Promise<HealthRecordDetail | null> {
  if (process.env.DATA_SOURCE !== 'fhir') {
    return null;
  }

  const fhir = client();

  if (kind === 'allergy') {
    const resource = await fhir.read<FhirAllergyIntolerance>(
      'AllergyIntolerance',
      id
    );
    return resource ? fhirAllergyToDetail(resource) : null;
  }

  const resource = await fhir.read<FhirCondition>('Condition', id);
  return resource ? fhirConditionToDetail(resource) : null;
}
