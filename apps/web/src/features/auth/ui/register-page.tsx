'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Card, CardHeader } from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';
import {
  completeGoogleRegistrationRequest,
  googleSignInRequest,
  registerWithPasswordRequest,
} from '@/lib/auth/auth-api';
import { useResolveAuthRedirect } from '@/features/auth/hooks/use-resolve-auth-redirect';
import { AuthBackButton } from '@/features/auth/ui/auth-back-button';

interface GoogleDraft {
  token: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export function RegisterPage() {
  const resolveAfterAuth = useResolveAuthRedirect();
  const [googleDraft, setGoogleDraft] = useState<GoogleDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [healthNumber, setHealthNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [googlePhone, setGooglePhone] = useState('');

  async function handleGoogleSuccess(credential: string) {
    setFormError(null);

    try {
      const result = await googleSignInRequest(credential);

      if (result.status === 'registration_required' && result.token) {
        setGoogleDraft({
          token: result.token,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
        });
        return;
      }

      await resolveAfterAuth();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to sign up with Google'
      );
    }
  }

  async function handleCompleteGoogleRegistration(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!googleDraft) {
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await completeGoogleRegistrationRequest(googleDraft.token, {
        firstName: googleDraft.firstName ?? '',
        lastName: googleDraft.lastName ?? '',
        email: googleDraft.email,
        phone: googlePhone,
      });
      await resolveAfterAuth();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to complete registration'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const optional = (value: string) => value.trim() || undefined;

      await registerWithPasswordRequest({
        firstName,
        lastName,
        password,
        dateOfBirth: optional(dateOfBirth),
        email: optional(email),
        phone,
        healthNumber: optional(healthNumber),
        addressLine: optional(addressLine),
        city: optional(city),
        province: optional(province),
        postalCode: optional(postalCode),
      });
      await resolveAfterAuth();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to complete registration'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (googleDraft) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-6 sm:p-6">
        <Card className="w-full max-w-md">
          <AuthBackButton
            onBack={() => {
              setGoogleDraft(null);
              setFormError(null);
            }}
          />
          <CardHeader
            title="Finish your profile"
            description="One more step — we need your phone number to create your account."
          />
          <form onSubmit={handleCompleteGoogleRegistration} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-accent-foreground">
                Name
              </span>
              <input
                type="text"
                value={`${googleDraft.firstName ?? ''} ${googleDraft.lastName ?? ''}`.trim()}
                readOnly
                className={`${inputClassName} bg-muted`}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-accent-foreground">
                Mobile number
              </span>
              <input
                type="tel"
                value={googlePhone}
                onChange={(event) => setGooglePhone(event.target.value)}
                className={inputClassName}
                placeholder="+1 555 0101"
                required
              />
            </label>
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6 sm:p-6">
      <Card className="w-full max-w-md">
        <AuthBackButton />
        <CardHeader
          title="Create your account"
          description="Sign up to book appointments and manage your care."
        />

        <div className="mb-4 flex justify-center">
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) {
                void handleGoogleSuccess(response.credential);
              }
            }}
            onError={() => setFormError('Unable to sign up with Google')}
          />
        </div>

        <div className="mb-4 flex items-center gap-3 text-xs text-faint-foreground">
          <span className="h-px flex-1 bg-border" />
          or sign up with phone
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleRegister} className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              First name
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Last name
            </span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Mobile number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClassName}
              placeholder="+1 555 0101"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
              minLength={8}
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Date of birth <span className="text-faint-foreground">(optional)</span>
            </span>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Email <span className="text-faint-foreground">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Health Insurance Number{' '}
              <span className="text-faint-foreground">(optional)</span>
            </span>
            <input
              type="text"
              value={healthNumber}
              onChange={(event) => setHealthNumber(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-accent-foreground">
              Address <span className="text-faint-foreground">(optional)</span>
            </span>
            <input
              type="text"
              value={addressLine}
              onChange={(event) => setAddressLine(event.target.value)}
              className={inputClassName}
              placeholder="Street address"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={inputClassName}
              placeholder="City"
            />
            <input
              type="text"
              value={province}
              onChange={(event) => setProvince(event.target.value)}
              className={inputClassName}
              placeholder="Province"
            />
            <input
              type="text"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              className={inputClassName}
              placeholder="Postal code"
            />
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
