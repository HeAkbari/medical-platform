import { cookies } from 'next/headers';
import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { SESSION_COOKIE_NAME, getSessionUser } from '@/lib/auth/session-cookie';
import { buildAuthenticatedUser } from '@/lib/auth/phone-auth-service';
import { repositories } from '@/lib/repositories';
import { updatePatientSchema } from '@medical-platform/domain/validation';

/**
 * Profile self-completion (first/last name, DOB, email, HIN, address) — the
 * first editable path in the app (previously fully read-only). Does not
 * touch OSCAR directly; see EnsurePatientLinkedToClinicUseCase for when
 * these fields get sent to a clinic.
 */
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(sessionId);

  if (!user) {
    return unauthorizedResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body');
  }

  const parsed = updatePatientSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? 'Invalid payload');
  }

  try {
    await repositories.patients.update(user.patientId, parsed.data);
    const updatedUser = await buildAuthenticatedUser({
      id: user.id,
      phone: user.phone,
      patientId: user.patientId,
    });

    if (!updatedUser) {
      return internalErrorResponse('Unable to load updated profile');
    }

    return jsonResponse({ user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update profile';
    return internalErrorResponse(message);
  }
}
