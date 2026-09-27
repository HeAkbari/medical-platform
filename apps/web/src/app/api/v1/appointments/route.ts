import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
  listResponse,
} from '@/lib/api-response';
import { appointmentService } from '@/lib/server-services';
import { OscarHttpError } from '@medical-platform/domain/adapters/oscar';
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
    // OscarHttpError's raw response body (often a Java stack trace) never
    // reaches the client on purpose — but it also wasn't going anywhere
    // else, making OSCAR-side 500s undebuggable from the dev console. Log
    // it server-side only.
    if (error instanceof OscarHttpError) {
      console.error(
        `OSCAR error creating appointment (status ${error.status}):`,
        error.body
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unable to create appointment';

    // PatientNotLinkableError (missing profile fields / multiple same-name
    // matches at the clinic) and "not found" doctor/patient lookups are both
    // client-actionable, not server failures.
    if (
      message.includes('not found') ||
      message.includes('missing required fields') ||
      message.includes('Multiple matching patient records')
    ) {
      return badRequestResponse(message);
    }

    return internalErrorResponse(message);
  }
}
