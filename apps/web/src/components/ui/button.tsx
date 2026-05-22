import { cn } from '@/components/ui/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-teal-700 text-white hover:bg-teal-800',
  secondary:
    'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
