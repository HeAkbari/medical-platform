import type { HomeSupportIcon } from '@/features/app-home/data/home-navigation';

const iconClassName = 'h-5 w-5 shrink-0';

export function HomeSupportIconGlyph({
  icon,
}: {
  icon: HomeSupportIcon;
}) {
  switch (icon) {
    case 'symptom-checker':
      return (
        <svg
          className={iconClassName}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'health-a-z':
      return (
        <svg
          className={iconClassName}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18v16H6.5A2.5 2.5 0 0 1 4 16.5v-11z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8 7h6M8 11h8M8 15h5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
