'use client';

import { cn } from '@/components/ui/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {label}
        </p>
        {description ? (
          <p className="mt-0.5 text-sm text-faint-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light/40 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'justify-end bg-brand' : 'justify-start bg-muted'
        )}
      >
        <span className="inline-block h-5 w-5 rounded-full bg-card shadow" />
      </button>
    </div>
  );
}
