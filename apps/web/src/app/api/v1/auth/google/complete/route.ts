import { completeGoogleRegistrationSchema } from '@medical-platform/domain/validation';
import { badRequestResponse } from '@/lib/api-response';
import { completeGoogleRegistration } from '@/lib/auth/auth-service';
import { createSessionCookie } from '@/lib/auth/session-cookie';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const parsed = completeGoogleRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(
        parsed.error.issues[0]?.message ?? 'Invalid registration data'
      );
    }

    const { token, ...patientInput } = parsed.data;
    const result = await completeGoogleRegistration(token, patientInput);

    return new Response(
      JSON.stringify({ user: result.user }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createSessionCookie(result.sessionId),
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to complete registration';

    return badRequestResponse(message);
  }
}
