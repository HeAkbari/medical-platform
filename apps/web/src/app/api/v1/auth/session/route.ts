import { cookies } from 'next/headers';
import { jsonResponse } from '@/lib/api-response';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session-cookie';
import { getSessionUser } from '@/lib/auth/session-cookie';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(sessionId);

  return jsonResponse({ user });
}
