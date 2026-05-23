export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-sm text-slate-500 sm:min-h-48 sm:px-6 sm:py-16">
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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 sm:px-6 sm:py-8">
      {message}
    </div>
  );
}
