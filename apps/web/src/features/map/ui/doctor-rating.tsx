interface DoctorRatingProps {
  rating: number;
  reviewCount: number;
  compact?: boolean;
  onClick?: () => void;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-slate-300'}`}
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function DoctorRating({
  rating,
  reviewCount,
  compact = false,
  onClick,
}: DoctorRatingProps) {
  const roundedRating = Math.round(rating * 10) / 10;
  const filledStars = Math.min(5, Math.max(0, Math.round(rating)));
  const label = `Rated ${roundedRating} out of 5 from ${reviewCount} reviews`;
  const content = (
    <>
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon key={index} filled={index < filledStars} />
        ))}
      </div>
      <span className="font-medium text-slate-800">{roundedRating.toFixed(1)}</span>
      {!compact ? (
        <span className={onClick ? 'text-teal-700 underline-offset-2 group-hover:underline' : 'text-slate-500'}>
          ({reviewCount} reviews)
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center gap-2 rounded-md text-left transition hover:opacity-80 ${compact ? 'text-xs' : 'text-sm'}`}
        aria-label={`${label}. Read reviews`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}
      aria-label={label}
    >
      {content}
    </div>
  );
}

export function formatDoctorRatingLabel(rating: number, reviewCount: number): string {
  return `${rating.toFixed(1)} (${reviewCount})`;
}
