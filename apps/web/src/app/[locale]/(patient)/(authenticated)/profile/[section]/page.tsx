import { ProfileSectionPage } from '@/features/profile-hub/ui/profile-section-page';

export default async function ProfileSectionRoutePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <ProfileSectionPage slug={section} />;
}
