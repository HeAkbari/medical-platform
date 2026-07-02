import { cn } from '@/components/ui/cn';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold sm:text-lg">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-faint-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="shrink-0 [&_a]:block [&_button]:w-full sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
