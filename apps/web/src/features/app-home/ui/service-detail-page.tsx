import { notFound } from 'next/navigation';
import {
  getHomeService,
  getHomeSupportPlaceholder,
} from '@/features/app-home/data/home-navigation';
import { HealthAzPage } from '@/features/app-home/ui/health-a-z-page';
import { SymptomCheckerPage } from '@/features/app-home/ui/symptom-checker-page';
import {
  DocumentsPage,
  HealthConditionsPage,
  PrescriptionsPage,
  TestResultsPage,
  VaccinationsPage,
} from '@/features/health-records';

export function ServiceDetailPage({ slug }: { slug: string }) {
  if (slug === 'appointments') {
    notFound();
  }

  if (slug === 'symptom-checker') {
    return <SymptomCheckerPage />;
  }

  if (slug === 'health-a-z') {
    return <HealthAzPage />;
  }

  if (slug === 'test-results') {
    return <TestResultsPage />;
  }

  if (slug === 'advices' || slug === 'health-conditions') {
    return <HealthConditionsPage />;
  }

  if (slug === 'documents') {
    return <DocumentsPage />;
  }

  // Legacy routes kept for bookmarks — out of PRD v0.3 home grid scope.
  if (slug === 'prescriptions') {
    return <PrescriptionsPage />;
  }

  if (slug === 'vaccinations') {
    return <VaccinationsPage />;
  }

  const service = getHomeService(slug);
  const support = getHomeSupportPlaceholder(slug);
  const item = service ?? support;

  if (!item) {
    notFound();
  }

  return notFound();
}
