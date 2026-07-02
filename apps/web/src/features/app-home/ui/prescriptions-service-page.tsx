import { Badge, Button, Card, CardHeader } from '@/components/ui';
import { MOCK_PRESCRIPTIONS } from '@/features/app-home/data/mock-patient-services';
import type { MockPrescription, PrescriptionStatus } from '@/features/app-home/types/patient-services';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';
import { formatServiceDate } from '@/features/app-home/utils/service-formatters';

function prescriptionStatusVariant(
  status: PrescriptionStatus
): 'default' | 'success' | 'warning' | 'muted' {
  switch (status) {
    case 'ready':
      return 'success';
    case 'processing':
      return 'warning';
    case 'expired':
    case 'needs-review':
      return 'muted';
    default:
      return 'default';
  }
}

function prescriptionStatusLabel(status: PrescriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Active repeat';
    case 'processing':
      return 'At pharmacy';
    case 'ready':
      return 'Ready to collect';
    case 'expired':
      return 'Expired';
    case 'needs-review':
      return 'Needs GP review';
  }
}

function canOrderRepeat(prescription: MockPrescription): boolean {
  return (
    prescription.status === 'active' &&
    prescription.repeatsRemaining > 0 &&
    Boolean(prescription.nextOrderEligibleAt)
  );
}

function PrescriptionRow({ prescription }: { prescription: MockPrescription }) {
  const orderEligible =
    prescription.nextOrderEligibleAt &&
    new Date(prescription.nextOrderEligibleAt) <= new Date();

  return (
    <article className="rounded-xl border border-border p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-foreground">{prescription.medication}</p>
          <p className="mt-0.5 text-sm text-brand">{prescription.dosage}</p>
        </div>
        <Badge variant={prescriptionStatusVariant(prescription.status)}>
          {prescriptionStatusLabel(prescription.status)}
        </Badge>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-faint-foreground">Prescribed by</dt>
          <dd className="font-medium text-subtle-foreground">{prescription.prescribedBy}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-faint-foreground">Pharmacy</dt>
          <dd>{prescription.pharmacy}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-faint-foreground">Last issued</dt>
          <dd>{formatServiceDate(prescription.lastIssuedAt)}</dd>
        </div>
        {prescription.repeatsRemaining > 0 ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-faint-foreground">Repeats left</dt>
            <dd>{prescription.repeatsRemaining}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {prescription.instructions}
      </p>

      {canOrderRepeat(prescription) ? (
        <div className="mt-4">
          <Button
            type="button"
            variant={orderEligible ? 'primary' : 'secondary'}
            disabled={!orderEligible}
            fullWidth
          >
            {orderEligible
              ? 'Order repeat prescription'
              : `Available from ${formatServiceDate(prescription.nextOrderEligibleAt!)}`}
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function PrescriptionsServicePage() {
  const activeCount = MOCK_PRESCRIPTIONS.filter(
    (item) => item.status === 'active' || item.status === 'processing'
  ).length;

  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Prescriptions"
          description="Order repeat prescriptions and choose a pharmacy."
          action={
            <p className="text-sm text-faint-foreground">
              {activeCount} active on record
            </p>
          }
        />

        <div className="space-y-3">
          {MOCK_PRESCRIPTIONS.map((prescription) => (
            <PrescriptionRow key={prescription.id} prescription={prescription} />
          ))}
        </div>
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
