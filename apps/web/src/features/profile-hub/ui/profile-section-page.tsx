import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui';
import { getProfileSection } from '@/features/profile-hub/data/profile-sections';

export function ProfileSectionPage({ slug }: { slug: string }) {
  const section = getProfileSection(slug as never);

  if (!section) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/profile"
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Profile
      </Link>

      <Card>
        <CardHeader title={section.title} description={section.description} />
        <p className="text-sm leading-6 text-slate-600">
          Placeholder screen for the MVP. Wire this section to authenticated
          profile APIs when available.
        </p>
      </Card>
    </div>
  );
}
