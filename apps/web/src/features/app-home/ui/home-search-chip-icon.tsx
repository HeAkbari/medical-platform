import type { HomeSearchChipIcon } from '@/features/app-home/data/home-search';

const iconClassName = 'h-3.5 w-3.5 shrink-0';

export function HomeSearchChipIconGlyph({
  icon,
}: {
  icon: HomeSearchChipIcon;
}) {
  switch (icon) {
    case 'zap':
      return (
        <svg
          className={iconClassName}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'stethoscope':
      return (
        <svg
          className={iconClassName}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          aria-hidden="true"
        >
          <path
            d="M6 4h4v8a4 4 0 0 1-8 0V8a2 2 0 0 1 2-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 8a4 4 0 0 1-4 4h-1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="16" r="3" />
          <path d="M14 12V6h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg
          className={iconClassName}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      );
    case 'walk-in':
      return (
        <svg
          className={iconClassName}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            d="M3 21V9l9-6 9 6v12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 21V12h6v9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 7v5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
