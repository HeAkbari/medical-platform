import { loginWithPasswordSchema } from '@medical-platform/domain/validation';
import { badRequestResponse } from '@/lib/api-response';
import { loginWithPassword } from '@/lib/auth/auth-service';
import { createSessionCookie } from '@/lib/auth/session-cookie';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; password?: string };
    const parsed = loginWithPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(
        parsed.error.issues[0]?.message ?? 'Invalid login credentials'
      );
    }

    const result = await loginWithPassword(parsed.data.phone, parsed.data.password);

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
    const message = error instanceof Error ? error.message : 'Unable to sign in';

    return badRequestResponse(message);
  }
}
