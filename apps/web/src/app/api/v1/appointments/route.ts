import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
  listResponse,
} from '@/lib/api-response';
import { appointmentService } from '@/lib/server-services';
import {
  appointmentQuerySchema,
  createAppointmentSchema,
} from '@medical-platform/domain/validation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = appointmentQuerySchema.safeParse({
    patientId: url.searchParams.get('patientId') ?? undefined,
    doctorId: url.searchParams.get('doctorId') ?? undefined,
    date: url.searchParams.get('date') ?? undefined,
  });

  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? 'Invalid query');
  }

  const appointments = await appointmentService.list(parsed.data);
  return listResponse(appointments);
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(
        parsed.error.issues[0]?.message ?? 'Invalid appointment payload'
      );
    }

    const appointment = await appointmentService.create(parsed.data);
    return jsonResponse({ data: appointment }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create appointment';

    if (message.includes('not found')) {
      return badRequestResponse(message);
    }

    return internalErrorResponse(message);
  }
}
