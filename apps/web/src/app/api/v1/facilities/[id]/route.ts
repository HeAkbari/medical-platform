import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadFacilityDetail } from '@/features/map/data/facility-detail-source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await loadFacilityDetail(id);

    if (!detail) {
      return notFoundResponse('Facility');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load facility';
    return internalErrorResponse(message);
  }
}
