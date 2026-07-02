import { cn } from '@/components/ui/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-brand-foreground hover:bg-brand-dark active:bg-brand-darker',
  secondary:
    'border border-border bg-card text-foreground hover:bg-accent active:bg-muted',
  ghost:
    'bg-transparent text-accent-foreground hover:bg-accent active:bg-muted',
};

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth && 'w-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
