import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadDocumentDetail } from '@/features/health-records/data/documents-source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await loadDocumentDetail(id);

    if (!detail) {
      return notFoundResponse('Document');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load document';
    return internalErrorResponse(message);
  }
}
