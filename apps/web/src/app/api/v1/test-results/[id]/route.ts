import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadTestResultDetail } from '@/features/health-records/data/test-result-detail-source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await loadTestResultDetail(id);

    if (!detail) {
      return notFoundResponse('Test result');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load test result';
    return internalErrorResponse(message);
  }
}
