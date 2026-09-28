'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Card, CardHeader } from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';
import { googleSignInRequest, loginWithPasswordRequest } from '@/lib/auth/auth-api';
import { useResolveAuthRedirect } from '@/features/auth/hooks/use-resolve-auth-redirect';
import { AuthBackButton } from '@/features/auth/ui/auth-back-button';

export function LoginPage() {
  const resolveAfterAuth = useResolveAuthRedirect();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await loginWithPasswordRequest(phone, password);
      await resolveAfterAuth();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credential: string) {
    setFormError(null);

    try {
      const result = await googleSignInRequest(credential);

      if (result.status === 'registration_required') {
        setFormError(
          'No account found for this Google account yet. Use "Create an account" to finish signing up.'
        );
        return;
      }

      await resolveAfterAuth();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to sign in with Google'
      );
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6 sm:p-6">
      <Card className="w-full max-w-md">
        <AuthBackButton />
        <CardHeader title="Sign in" description="Access your patient account." />

        <div className="mb-4 flex justify-center">
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) {
                void handleGoogleSuccess(response.credential);
              }
            }}
            onError={() => setFormError('Unable to sign in with Google')}
          />
        </div>

        <div className="mb-4 flex items-center gap-3 text-xs text-faint-foreground">
          <span className="h-px flex-1 bg-border" />
          or sign in with phone
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
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
              required
            />
          </label>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
