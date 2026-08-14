import { repositories } from '@/lib/repositories';
import type { DocumentDetail, DocumentRecord } from './clinical-record-types';

/** Delegates entirely to the active DocumentRepository (mock/fhir/oscar). */
export async function loadDocuments(patientId?: string): Promise<DocumentRecord[]> {
  return repositories.documents.findAll(patientId);
}

export async function loadDocumentDetail(id: string): Promise<DocumentDetail | null> {
  return repositories.documents.findById(id);
}
