'use client';

import { notFound } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui';
import { getProfileSection } from '@/features/profile-hub/data/profile-sections';
import { useBackNavigation } from '@/hooks';

export function ProfileSectionPage({ slug }: { slug: string }) {
  const handleBack = useBackNavigation('/profile');
  const section = getProfileSection(slug as never);

  if (!section) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Profile
      </button>

      <Card>
        <CardHeader title={section.title} description={section.description} />
        <p className="text-sm leading-6 text-muted-foreground">
          Placeholder screen for the MVP. Wire this section to authenticated
          profile APIs when available.
        </p>
      </Card>
    </div>
  );
}
