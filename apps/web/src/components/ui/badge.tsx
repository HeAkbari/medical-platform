import { cn } from '@/components/ui/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'muted';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-brand-muted text-brand-dark',
  success: 'bg-success-subtle text-success-foreground',
  warning: 'bg-warning-subtle text-warning-foreground',
  muted: 'bg-muted text-muted-foreground',
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
