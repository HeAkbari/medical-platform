import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { loadAppointmentDetail } from '@/features/appointments/data/appointment-detail-source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await loadAppointmentDetail(id);

    if (!detail) {
      return notFoundResponse('Appointment');
    }

    return jsonResponse({ data: detail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load appointment';
    return internalErrorResponse(message);
  }
}
