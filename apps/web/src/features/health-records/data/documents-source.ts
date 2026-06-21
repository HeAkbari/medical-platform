import {
  FhirClient,
  type FhirDocumentReference,
} from '@medical-platform/domain';
import type { DocumentDetail, DocumentRecord } from './clinical-record-types';
import { fhirDocumentToDetail, fhirDocumentToRecord } from './document-mapper';

function client(): FhirClient {
  return new FhirClient({
    baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
    token: process.env.FHIR_TOKEN,
  });
}

function byDateDesc(a: DocumentRecord, b: DocumentRecord): number {
  return (b.date ?? '').localeCompare(a.date ?? '');
}

const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'mock-doc-1',
    title: 'Discharge summary - May 2026.pdf',
    type: 'Discharge summary',
    date: '2026-05-10T16:00:00-04:00',
    patientId: 'mock-patient',
  },
];

export async function loadDocuments(
  patientId?: string
): Promise<DocumentRecord[]> {
  if (process.env.DATA_SOURCE === 'fhir') {
    const resources = await client().search<FhirDocumentReference>(
      'DocumentReference',
      { patient: patientId ? `Patient/${patientId}` : undefined }
    );
    return resources.map(fhirDocumentToRecord).sort(byDateDesc);
  }

  return [...MOCK_DOCUMENTS].sort(byDateDesc);
}

export async function loadDocumentDetail(
  id: string
): Promise<DocumentDetail | null> {
  if (process.env.DATA_SOURCE !== 'fhir') {
    return null;
  }

  const resource = await client().read<FhirDocumentReference>(
    'DocumentReference',
    id
  );
  return resource ? fhirDocumentToDetail(resource) : null;
}
