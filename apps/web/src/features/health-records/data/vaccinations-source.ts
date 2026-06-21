import {
  FhirClient,
  type FhirImmunization,
} from '@medical-platform/domain';
import type {
  Vaccination,
  VaccinationDetail,
} from './clinical-record-types';
import {
  fhirImmunizationToDetail,
  fhirImmunizationToVaccination,
} from './immunization-mapper';

function client(): FhirClient {
  return new FhirClient({
    baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
    token: process.env.FHIR_TOKEN,
  });
}

function byDateDesc(a: Vaccination, b: Vaccination): number {
  return (b.date ?? '').localeCompare(a.date ?? '');
}

const MOCK_VACCINATIONS: Vaccination[] = [
  {
    id: 'mock-imm-1',
    name: 'COVID-19 mRNA (Comirnaty)',
    status: 'completed',
    date: '2025-10-15',
    doseNumber: 3,
    seriesDoses: 3,
    patientId: 'mock-patient',
  },
];

export async function loadVaccinations(
  patientId?: string
): Promise<Vaccination[]> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const resources = await client().search<FhirImmunization>('Immunization', {
      patient: patientId ? `Patient/${patientId}` : undefined,
    });
    return resources.map(fhirImmunizationToVaccination).sort(byDateDesc);
  }

  return [...MOCK_VACCINATIONS].sort(byDateDesc);
}

export async function loadVaccinationDetail(
  id: string
): Promise<VaccinationDetail | null> {
  if (process.env.DATA_SOURCE !== 'fhir') {
    return null;
  }

  const resource = await client().read<FhirImmunization>('Immunization', id);
  return resource ? fhirImmunizationToDetail(resource) : null;
}
