import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadVaccinationDetail } from '@/features/health-records/data/vaccinations-source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await loadVaccinationDetail(id);

    if (!detail) {
      return notFoundResponse('Vaccination');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load vaccination';
    return internalErrorResponse(message);
  }
}
