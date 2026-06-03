import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui';
import {
  getHomeService,
  getHomeSupportPlaceholder,
} from '@/features/app-home/data/home-navigation';

export function ServiceDetailPage({ slug }: { slug: string }) {
  if (slug === 'appointments') {
    notFound();
  }

  const service = getHomeService(slug);
  const support = getHomeSupportPlaceholder(slug);
  const item = service ?? support;

  if (!item) {
    notFound();
  }

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
        <CardHeader title={item.title} description={item.description} />

        <p className="text-sm leading-6 text-slate-600">
          This section is a UI placeholder for the MVP. Connect it to live APIs
          when backend services are ready.
        </p>
      </Card>
    </div>
  );
}
