'use client';

import { cn } from '@/components/ui/cn';
import { getTempDoctorImageUrl } from '@/features/doctors/data/temp-doctor-images';

const sizeClasses = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-11 w-11 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-36 w-36 text-3xl',
} as const;

type AvatarSize = keyof typeof sizeClasses;

/**
 * TEMP-aware avatar: shows `/dr-images` headshot when mapped, else initials.
 * Remove temp image usage with `temp-doctor-images.ts` later.
 */
export function PhysicianAvatar({
  firstName,
  lastName,
  doctorId,
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
  const src = getTempDoctorImageUrl({
    id: doctorId,
    firstName,
    lastName,
  });

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- temp local public assets
      <img
        src={src}
        alt=""
        className={cn(
          'shrink-0 object-cover',
          sizeClasses[size],
          shapeClass,
          className,
        )}
        aria-hidden="true"
      />
    );
  }

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
