export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-sm text-slate-500">
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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-sm text-red-700">
      {message}
    </div>
  );
}
