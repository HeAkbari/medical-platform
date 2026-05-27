import { verifyOtpSchema } from '@medical-platform/domain/validation';
import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
} from '@/lib/api-response';
import { verifyOtp } from '@/lib/auth/phone-auth-service';
import { createSessionCookie } from '@/lib/auth/session-cookie';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; code?: string };
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(
        parsed.error.issues[0]?.message ?? 'Invalid verification payload'
      );
    }

    const result = await verifyOtp(parsed.data.phone, parsed.data.code);

    if (result.status === 'registration_required') {
      return jsonResponse({
        status: result.status,
        registrationToken: result.registrationToken,
        phone: result.phone,
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
      error instanceof Error ? error.message : 'Unable to verify code';

    return badRequestResponse(message);
  }
}
