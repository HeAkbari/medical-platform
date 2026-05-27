import type { AuthenticatedUser } from '@medical-platform/auth';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  deleteSession,
  getUserBySessionId,
} from './phone-auth-service';

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };

export function createSessionCookie(sessionId: string): string {
  const secure =
    process.env.NODE_ENV === 'production' ? '; Secure' : '';

  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function clearSessionCookie(): string {
  const secure =
    process.env.NODE_ENV === 'production' ? '; Secure' : '';

  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function getSessionUser(
  sessionId: string | undefined
): Promise<AuthenticatedUser | null> {
  if (!sessionId) {
    return null;
  }

  return getUserBySessionId(sessionId);
}

export function destroySession(sessionId: string | undefined): void {
  if (!sessionId) {
    return;
  }

  deleteSession(sessionId);
}
