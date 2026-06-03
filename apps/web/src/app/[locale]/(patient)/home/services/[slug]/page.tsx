import { AuthGuard } from '@/components/layout';
import { ServiceDetailPage } from '@/features/app-home/ui/service-detail-page';
import { isUserServiceSlug } from '@/features/app-home/data/home-navigation';

export default async function HomeServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isUserServiceSlug(slug)) {
    return (
      <AuthGuard>
        <ServiceDetailPage slug={slug} />
      </AuthGuard>
    );
  }

  return <ServiceDetailPage slug={slug} />;
}
