import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { Card, CardHeader } from '@/components/ui';
import {
  getHomeService,
  type HomeServiceSlug,
  type HomeSupportSlug,
} from '@/features/app-home/data/home-navigation';
import { DocumentsServicePage } from '@/features/app-home/ui/documents-service-page';
import { HealthAzPage } from '@/features/app-home/ui/health-a-z-page';
import { HealthConditionsServicePage } from '@/features/app-home/ui/health-conditions-service-page';
import { PrescriptionsServicePage } from '@/features/app-home/ui/prescriptions-service-page';
import { SymptomCheckerPage } from '@/features/app-home/ui/symptom-checker-page';
import { TestResultsServicePage } from '@/features/app-home/ui/test-results-service-page';
import { VaccinationsServicePage } from '@/features/app-home/ui/vaccinations-service-page';

function SupportPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>

      <Card>
        <CardHeader title={title} description={description} />
        <p className="text-sm leading-6 text-slate-600">
          This section is a UI placeholder for the MVP. Connect it to live APIs
          when backend services are ready.
        </p>
      </Card>
    </div>
  );
}

const SERVICE_PAGES: Record<
  Exclude<HomeServiceSlug, 'appointments'>,
  () => ReactNode
> = {
  prescriptions: () => <PrescriptionsServicePage />,
  'test-results': () => <TestResultsServicePage />,
  vaccinations: () => <VaccinationsServicePage />,
  'health-conditions': () => <HealthConditionsServicePage />,
  documents: () => <DocumentsServicePage />,
};

const SUPPORT_PAGES: Record<HomeSupportSlug, () => ReactNode> = {
  'symptom-checker': () => <SymptomCheckerPage />,
  'health-a-z': () => <HealthAzPage />,
  'local-services': () => (
    <SupportPlaceholderPage
      title="Local services"
      description="Find pharmacies, clinics, and support services near you."
    />
  ),
};

export function ServiceDetailPage({ slug }: { slug: string }) {
  if (slug === 'appointments') {
    notFound();
  }

  if (slug in SERVICE_PAGES) {
    const render = SERVICE_PAGES[slug as Exclude<HomeServiceSlug, 'appointments'>];
    return render();
  }

  if (slug in SUPPORT_PAGES) {
    const render = SUPPORT_PAGES[slug as HomeSupportSlug];
    return render();
  }

  const service = getHomeService(slug);
  if (!service) {
    notFound();
  }

  return (
    <SupportPlaceholderPage
      title={service.title}
      description={service.description}
    />
  );
}
