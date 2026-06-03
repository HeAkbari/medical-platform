'use client';

import { DM_Serif_Display } from 'next/font/google';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/components/ui/cn';

const splashTitleFont = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
});

const SPLASH_AUTO_DISMISS_MS = 5000;
interface AppIntroScreenProps {
  onComplete: () => void;
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
      aria-label="Canadian Health Services"
      className={cn(
        'fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-brand px-8 text-brand-foreground',
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
          src="/chs-logo.png"
          alt=""
          width={1024}
          height={426}
          priority
          aria-hidden
          className="h-20 w-auto max-w-[min(100%,20rem)] mix-blend-screen sm:h-24"
        />
        <h1
          className={cn(
            splashTitleFont.className,
            'mt-2 max-w-[13rem] text-base font-normal leading-snug tracking-wide text-brand-logo-text sm:max-w-[14rem] sm:text-lg',
          )}
        >
          Canadian Health Services
        </h1>
        <Image
          src="/chs-heart.png"
          alt=""
          width={1000}
          height={1000}
          priority
          aria-hidden
          className="mt-12 h-40 w-40 object-contain mix-blend-screen sm:mt-14 sm:h-48 sm:w-48"
        />{' '}
      </div>
    </div>
  );
}
