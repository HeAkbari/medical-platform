import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  destroySession,
} from '@/lib/auth/session-cookie';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  destroySession(sessionId);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
}
