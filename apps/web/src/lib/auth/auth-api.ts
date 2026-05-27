import type { AuthenticatedUser } from '@medical-platform/auth';
import type { CreatePatientInput } from '@medical-platform/domain/validation';

interface SessionResponse {
  user: AuthenticatedUser | null;
}

interface VerifyOtpResponse {
  status: 'authenticated' | 'registration_required';
  user?: AuthenticatedUser;
  registrationToken?: string;
  phone?: string;
}

interface RegisterResponse {
  user: AuthenticatedUser;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  return body?.message ?? 'Request failed';
}

export async function fetchSession(): Promise<AuthenticatedUser | null> {
  const response = await fetch('/api/v1/auth/session');

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as SessionResponse;
  return body.user;
}

export async function sendOtpRequest(phone: string): Promise<void> {
  const response = await fetch('/api/v1/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function verifyOtpRequest(
  phone: string,
  code: string
): Promise<VerifyOtpResponse> {
  const response = await fetch('/api/v1/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as VerifyOtpResponse;
}

export async function registerPatientRequest(
  registrationToken: string,
  input: CreatePatientInput
): Promise<AuthenticatedUser> {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationToken, ...input }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as RegisterResponse;
  return body.user;
}

export async function logoutRequest(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout', { method: 'POST' });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}
