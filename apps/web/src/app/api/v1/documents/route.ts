import { internalErrorResponse, listResponse } from '@/lib/api-response';
import { loadDocuments } from '@/features/health-records/data/documents-source';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId') ?? undefined;
    const documents = await loadDocuments(patientId);
    return listResponse(documents);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load documents';
    return internalErrorResponse(message);
  }
}
