import { Badge, Button, Card, CardHeader } from '@/components/ui';
import { MOCK_HEALTH_DOCUMENTS } from '@/features/app-home/data/mock-patient-services';
import type {
  HealthDocumentType,
  MockHealthDocument,
} from '@/features/app-home/types/patient-services';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';
import { formatServiceDate } from '@/features/app-home/utils/service-formatters';

function documentTypeLabel(type: HealthDocumentType): string {
  switch (type) {
    case 'letter':
      return 'Letter';
    case 'sick-note':
      return 'Sick note';
    case 'referral':
      return 'Referral';
    case 'lab-requisition':
      return 'Lab requisition';
    case 'discharge':
      return 'Discharge summary';
    case 'other':
      return 'Document';
  }
}

function DocumentRow({ document }: { document: MockHealthDocument }) {
  return (
    <article className="rounded-xl border border-border p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{document.title}</p>
          <p className="mt-0.5 text-sm text-faint-foreground">{document.from}</p>
        </div>
        <Badge variant="muted">{documentTypeLabel(document.type)}</Badge>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">{document.summary}</p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-faint-foreground">
          {formatServiceDate(document.date)}
        </p>
        <Button type="button" variant="secondary" disabled>
          View PDF (mock)
        </Button>
      </div>
    </article>
  );
}

export function DocumentsServicePage() {
  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Documents"
          description="Letters and documents from your GP or hospital."
        />

        <div className="space-y-3">
          {MOCK_HEALTH_DOCUMENTS.map((document) => (
            <DocumentRow key={document.id} document={document} />
          ))}
        </div>
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
