import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadHealthRecordDetail } from '@/features/health-records/data/health-conditions-source';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kind = new URL(request.url).searchParams.get('kind');

    if (kind !== 'condition' && kind !== 'allergy') {
      return badRequestResponse('kind must be "condition" or "allergy"');
    }

    const detail = await loadHealthRecordDetail(id, kind);

    if (!detail) {
      return notFoundResponse('Health record');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load health record';
    return internalErrorResponse(message);
  }
}
