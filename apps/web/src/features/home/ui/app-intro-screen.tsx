'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/components/ui/cn';

const SPLASH_AUTO_DISMISS_MS = 5000;

interface AppIntroScreenProps {
  onComplete: () => void;
}

function SplashHeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-10 w-10 text-brand-foreground/80"
    >
      <path
        fill="currentColor"
        d="M24 42s-14-9.6-14-20.2C10 14.9 16.5 10 24 16c7.5-6 14-1.1 14 5.8C38 32.4 24 42 24 42z"
      />
    </svg>
  );
}

export function AppIntroScreen({ onComplete }: AppIntroScreenProps) {
  const hasDismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (hasDismissedRef.current) {
      return;
    }

    hasDismissedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(dismiss, SPLASH_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Medical Platform"
      className={cn(
        'fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-brand px-8 text-brand-foreground'
      )}
      onClick={dismiss}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          dismiss();
        }
      }}
    >
      <div className="flex flex-col items-center text-center">
        <Image
          src="/brand-logo.svg"
          alt=""
          width={88}
          height={88}
          priority
          className="h-[5.5rem] w-[5.5rem]"
        />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-brand-foreground">
          Medical Platform
        </h1>

        <div className="mt-5">
          <SplashHeartIcon />
        </div>
      </div>
    </div>
  );
}
