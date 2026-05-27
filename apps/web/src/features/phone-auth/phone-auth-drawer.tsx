'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';
import { useAuth } from '@/lib/auth';
import {
  registerPatientRequest,
  sendOtpRequest,
  verifyOtpRequest,
} from '@/lib/auth/auth-api';
import {
  usePhoneAuthStore,
  type PhoneAuthStep,
} from '@/features/phone-auth/store/phone-auth-store';

function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4 space-y-1">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

export function PhoneAuthDrawer() {
  const { user, refreshSession, logout } = useAuth();
  const authOpen = usePhoneAuthStore((state) => state.authOpen);
  const setAuthOpen = usePhoneAuthStore((state) => state.setAuthOpen);
  const step = usePhoneAuthStore((state) => state.step);
  const setStep = usePhoneAuthStore((state) => state.setStep);
  const phone = usePhoneAuthStore((state) => state.phone);
  const setPhone = usePhoneAuthStore((state) => state.setPhone);
  const registrationToken = usePhoneAuthStore((state) => state.registrationToken);
  const setRegistrationToken = usePhoneAuthStore(
    (state) => state.setRegistrationToken
  );
  const completePendingAction = usePhoneAuthStore(
    (state) => state.completePendingAction
  );
  const resetFlow = usePhoneAuthStore((state) => state.resetFlow);

  const [otpCode, setOtpCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeStep: PhoneAuthStep =
    step === 'profile' && user ? 'profile' : step;

  async function handleAuthenticated() {
    await refreshSession();
    completePendingAction();
  }

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await sendOtpRequest(phone);
      setOtpCode('');
      setStep('otp');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to send verification code'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await verifyOtpRequest(phone, otpCode);

      if (result.status === 'registration_required') {
        setRegistrationToken(result.registrationToken ?? null);
        setStep('register');
        return;
      }

      await handleAuthenticated();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to verify code'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!registrationToken) {
      setFormError('Registration session expired. Start again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerPatientRequest(registrationToken, {
        firstName,
        lastName,
        dateOfBirth,
        email,
        phone,
      });
      await handleAuthenticated();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to complete registration'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    resetFlow();
    setAuthOpen(false);
  }

  function handleOpenChange(open: boolean) {
    if (open && user) {
      setStep('profile');
    }

    if (!open) {
      setFormError(null);
      setOtpCode('');
      resetFlow();
    }

    setAuthOpen(open);
  }

  return (
    <Drawer.Root open={authOpen} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-fit max-h-[88vh] flex-col rounded-t-[10px] bg-gray-100 outline-none">
          <div className="flex max-h-[88vh] flex-col rounded-t-[10px] bg-white p-4">
            <div className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />

            <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col overflow-y-auto pb-2">
              <Drawer.Title className="mb-4 font-medium text-gray-900">
                {activeStep === 'profile' ? 'My profile' : 'Sign in with phone'}
              </Drawer.Title>

              {activeStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="grid gap-4">
                  <StepIntro
                    title="Enter your mobile number"
                    description="We will send a one-time code to verify your phone."
                  />
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
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
                  <p className="text-xs text-slate-500">
                    Dev OTP code: <span className="font-medium">123456</span>
                  </p>
                  {formError ? (
                    <p className="text-sm text-red-600">{formError}</p>
                  ) : null}
                  <Button type="submit" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send code'}
                  </Button>
                </form>
              ) : null}

              {activeStep === 'otp' ? (
                <form onSubmit={handleVerifyOtp} className="grid gap-4">
                  <StepIntro
                    title="Enter verification code"
                    description={`Code sent to ${phone}`}
                  />
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      6-digit code
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(event) =>
                        setOtpCode(event.target.value.replace(/\D/g, ''))
                      }
                      className={inputClassName}
                      placeholder="123456"
                      required
                    />
                  </label>
                  {formError ? (
                    <p className="text-sm text-red-600">{formError}</p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={() => setStep('phone')}
                    >
                      Back
                    </Button>
                    <Button type="submit" fullWidth disabled={isSubmitting}>
                      {isSubmitting ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </form>
              ) : null}

              {activeStep === 'register' ? (
                <form onSubmit={handleRegister} className="grid gap-4">
                  <StepIntro
                    title="Complete your profile"
                    description="Create your patient profile to book appointments."
                  />
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Mobile number
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      readOnly
                      className={`${inputClassName} bg-slate-50`}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
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
                    <span className="text-sm font-medium text-slate-700">
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
                    <span className="text-sm font-medium text-slate-700">
                      Date of birth
                    </span>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      className={inputClassName}
                      required
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Email
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={inputClassName}
                      required
                    />
                  </label>
                  {formError ? (
                    <p className="text-sm text-red-600">{formError}</p>
                  ) : null}
                  <Button type="submit" fullWidth disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </form>
              ) : null}

              {activeStep === 'profile' && user ? (
                <div className="grid gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{user.phone}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setAuthOpen(false)}
                    >
                      Close
                    </Button>
                    <Button fullWidth onClick={handleLogout}>
                      Log out
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
