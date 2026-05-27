import { sendOtpSchema } from '@medical-platform/domain/validation';
import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
} from '@/lib/api-response';
import { sendOtp } from '@/lib/auth/phone-auth-service';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse(
        parsed.error.issues[0]?.message ?? 'Invalid phone number'
      );
    }

    const result = await sendOtp(parsed.data.phone);
    return jsonResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send verification code';

    return internalErrorResponse(message);
  }
}
