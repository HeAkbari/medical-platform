'use client';

import { cn } from '@/components/ui/cn';

const sizeClasses = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-11 w-11 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-36 w-36 text-3xl',
} as const;

type AvatarSize = keyof typeof sizeClasses;

/**
 * Photo support is intentionally deferred (no source yet — see
 * docs/oscar/new-approach/deferred-items.md) — always shows initials.
 */
export function PhysicianAvatar({
  firstName,
  lastName,
  doctorId: _doctorId,
  size = 'md',
  shape = 'rounded',
  className,
}: {
  firstName: string;
  lastName: string;
  doctorId?: string | null;
  size?: AvatarSize;
  shape?: 'rounded' | 'circle';
  className?: string;
}) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-brand font-bold text-brand-foreground',
        sizeClasses[size],
        shapeClass,
        className,
      )}
      aria-hidden="true"
    >
      {firstName.charAt(0)}
      {lastName.charAt(0)}
    </div>
  );
}
