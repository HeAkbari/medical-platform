import { googleSignInSchema } from '@medical-platform/domain/validation';
import { badRequestResponse, jsonResponse } from '@/lib/api-response';
import { googleSignIn } from '@/lib/auth/auth-service';
import { createSessionCookie } from '@/lib/auth/session-cookie';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const parsed = googleSignInSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(
        parsed.error.issues[0]?.message ?? 'Invalid Google sign-in request'
      );
    }

    const result = await googleSignIn(parsed.data.idToken);

    if (result.status === 'registration_required') {
      return jsonResponse({
        status: result.status,
        token: result.token,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
      });
    }

    return new Response(
      JSON.stringify({ status: result.status, user: result.user }),
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
      error instanceof Error ? error.message : 'Unable to sign in with Google';

    return badRequestResponse(message);
  }
}
