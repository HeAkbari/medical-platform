import { cn } from '@/components/ui/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'muted';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-teal-100 text-teal-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  muted: 'bg-slate-100 text-slate-700',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
