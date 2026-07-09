import { cn } from '@/components/ui/cn';

export type NavDrawerIconName =
  | 'map'
  | 'healthcare-team'
  | 'settings'
  | 'contact'
  | 'logout'
  | 'notifications'
  | 'theme'
  | 'two-step'
  | 'face-id'
  | 'delete-account'
  | 'terms'
  | 'privacy'
  | 'call'
  | 'email'
  | 'rate-app';

const sizeClassName = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
} as const;

export function NavDrawerIconGlyph({
  name,
  size = 'md',
  className,
}: {
  name: NavDrawerIconName;
  size?: keyof typeof sizeClassName;
  className?: string;
}) {
  const common = cn(sizeClassName[size], 'shrink-0', className);

  switch (name) {
    case 'map':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
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
    case 'healthcare-team':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M16 11a3 3 0 1 0-6 0M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M19 8v6M16 11h6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'settings':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2.1 2.1 0 0 1-2.97 2.97l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2.1 2.1 0 0 1-4.2 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2.1 2.1 0 0 1-2.97-2.97l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2.1 2.1 0 0 1 0-4.2h.09a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2.1 2.1 0 0 1 2.97-2.97l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 9.5 3.09V3a2.1 2.1 0 0 1 4.2 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2.1 2.1 0 0 1 2.97 2.97l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2.1 2.1 0 0 1 0 4.2h-.09a1.7 1.7 0 0 0-1.56 1.03z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'contact':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'logout':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
          <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'notifications':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
        </svg>
      );
    case 'theme':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'two-step':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M12 3l7 4v5c0 4.2-2.8 7.7-7 9-4.2-1.3-7-4.8-7-9V7l7-4z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9.5 12.5 11 14l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'face-id':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
          <path d="M9 8.5h.01M15 8.5h.01" strokeLinecap="round" />
        </svg>
      );
    case 'delete-account':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
      );
    case 'terms':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M8 4h8v16H8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 9h4M10 13h4M10 17h2" strokeLinecap="round" />
        </svg>
      );
    case 'privacy':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'call':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="M6.5 4.8c.4-1 1.5-1.3 2.3-.6l1.6 1.3c.7.6.8 1.6.3 2.3l-1 1.4c1.2 2.2 3.1 4.1 5.3 5.3l1.4-1c.7-.5 1.7-.4 2.3.3l1.3 1.6c.7.8.4 1.9-.6 2.3-1.5.6-3.2.7-4.9.2a12.5 12.5 0 0 1-7.2-7.2c-.5-1.7-.4-3.4.2-4.9z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'email':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'rate-app':
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            d="m12 3 2.4 5.6L20 9.3l-4.5 3.9 1.4 5.8L12 16.8 7.1 19l1.4-5.8L4 9.3l5.6-.7L12 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function NavDrawerItemIcon({
  name,
  size = 'md',
  className,
}: {
  name: NavDrawerIconName;
  size?: keyof typeof sizeClassName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center text-muted-foreground',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
        className,
      )}
      aria-hidden="true"
    >
      <NavDrawerIconGlyph name={name} size={size} />
    </span>
  );
}
