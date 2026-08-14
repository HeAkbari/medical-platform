import { cookies } from 'next/headers';
import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { SESSION_COOKIE_NAME, getSessionUser } from '@/lib/auth/session-cookie';
import { OSCAR_CLINIC_ID } from '@/lib/oscar/client';
import { getLinkPatientToClinicUseCase } from '@/lib/oscar/link-patient-to-clinic';
import { linkPatientToClinicSchema } from '@medical-platform/domain/validation';

/**
 * Links the signed-in patient to their existing OSCAR demographic record via
 * HIN+DOB matching — never at registration, only the first time a patient
 * needs clinic/clinical data (e.g. booking). Never creates a new EMR record;
 * see docs/oscar/new-approach/patient-clinic-linking-architecture.md.
 */
export async function POST(request: Request) {
  if (process.env.DATA_SOURCE !== 'oscar') {
    return badRequestResponse('Clinic linking is only available when DATA_SOURCE=oscar.');
  }

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

  const parsed = linkPatientToClinicSchema.safeParse(body);

  if (!parsed.success) {
    return badRequestResponse(parsed.error.issues[0]?.message ?? 'Invalid payload');
  }

  try {
    const useCase = await getLinkPatientToClinicUseCase();
    const result = await useCase.execute({
      patientId: user.patientId,
      clinicId: OSCAR_CLINIC_ID,
      healthNumber: parsed.data.healthNumber,
      dateOfBirth: parsed.data.dateOfBirth,
    });

    if (result.status === 'linked' || result.status === 'already_linked') {
      return jsonResponse({
        data: { status: result.status, externalPatientId: result.externalPatientId },
      });
    }

    if (result.status === 'not_found') {
      return badRequestResponse(
        'No matching patient record was found. Please contact your clinic for assistance.'
      );
    }

    if (result.status === 'invalid_data') {
      return badRequestResponse('Health number and date of birth are required.');
    }

    return internalErrorResponse(
      'The clinic system is temporarily unavailable. Please try again later.'
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to link patient to clinic';
    return internalErrorResponse(message);
  }
}
