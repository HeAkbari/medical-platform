export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-sm text-faint-foreground sm:min-h-48 sm:px-6 sm:py-16">
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center sm:px-6 sm:py-16">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-faint-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-error-subtle bg-error-subtle px-4 py-6 text-sm text-error-foreground sm:px-6 sm:py-8">
      {message}
    </div>
  );
}
