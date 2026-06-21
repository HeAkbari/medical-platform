import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadPrescriptionDetail } from '@/features/health-records/data/prescription-detail-source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await loadPrescriptionDetail(id);

    if (!detail) {
      return notFoundResponse('Prescription');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load prescription';
    return internalErrorResponse(message);
  }
}
