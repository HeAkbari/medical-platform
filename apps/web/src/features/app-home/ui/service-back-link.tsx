import Link from 'next/link';

export function ServiceBackLink() {
  return (
    <Link
      href="/home"
      scroll={false}
      className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
    >
      ← Back to Home
    </Link>
  );
}
