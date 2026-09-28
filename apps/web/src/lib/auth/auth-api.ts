import type { AuthenticatedUser } from '@medical-platform/auth';
import type {
  CreatePatientInput,
  UpdatePatientInput,
} from '@medical-platform/domain/validation';

interface SessionResponse {
  user: AuthenticatedUser | null;
}

interface AuthResponse {
  user: AuthenticatedUser;
}

interface GoogleSignInResponse {
  status: 'authenticated' | 'registration_required';
  user?: AuthenticatedUser;
  token?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
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

export async function loginWithPasswordRequest(
  phone: string,
  password: string
): Promise<AuthenticatedUser> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
}

export async function registerWithPasswordRequest(
  input: CreatePatientInput & { password: string }
): Promise<AuthenticatedUser> {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
}

export async function googleSignInRequest(
  idToken: string
): Promise<GoogleSignInResponse> {
  const response = await fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as GoogleSignInResponse;
}

export async function completeGoogleRegistrationRequest(
  token: string,
  input: CreatePatientInput
): Promise<AuthenticatedUser> {
  const response = await fetch('/api/v1/auth/google/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...input }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
}

export async function updateProfileRequest(
  input: UpdatePatientInput
): Promise<AuthenticatedUser> {
  const response = await fetch('/api/v1/patients/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
}

export async function logoutRequest(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout', { method: 'POST' });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}
