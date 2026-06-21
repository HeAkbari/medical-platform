import {
  internalErrorResponse,
  jsonResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { appointmentService } from '@/lib/server-services';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await appointmentService.cancel(id);

    if (!appointment) {
      return notFoundResponse('Appointment');
    }

    return jsonResponse({ data: appointment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to cancel appointment';
    return internalErrorResponse(message);
  }
}
