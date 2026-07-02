'use client';

import { Drawer } from 'vaul';
import {
  Badge,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
} from '@/components/ui';
import { usePrescriptionDetailQuery } from '../hooks/use-prescription-detail-query';
import type {
  PrescriptionDetail,
  PrescriptionDispense,
} from '../data/health-record-types';

function statusVariant(status: string) {
  if (status === 'active') {
    return 'success' as const;
  }
  if (
    status === 'cancelled' ||
    status === 'stopped' ||
    status === 'completed' ||
    status === 'entered-in-error'
  ) {
    return 'muted' as const;
  }
  return 'default' as const;
}

function formatDate(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-faint-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function DispenseRow({ dispense }: { dispense: PrescriptionDispense }) {
  return (
    <div className="rounded-lg border border-border p-2.5 text-sm">
      <div className="flex justify-between gap-3">
        <span className="font-medium text-foreground">
          {dispense.pharmacy ?? 'Pharmacy'}
        </span>
        {dispense.handedOver ? (
          <span className="text-faint-foreground">
            {formatDate(dispense.handedOver)}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-faint-foreground">
        {[dispense.quantity, dispense.daysSupply && `${dispense.daysSupply} supply`]
          .filter(Boolean)
          .join(' · ')}
      </p>
    </div>
  );
}

function DetailBody({ detail }: { detail: PrescriptionDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {detail.medication}
          </h3>
          {detail.courseOfTherapy ? (
            <p className="mt-0.5 text-sm text-faint-foreground">
              {detail.courseOfTherapy}
            </p>
          ) : null}
        </div>
        <Badge variant={statusVariant(detail.status)}>{detail.status}</Badge>
      </div>

      {detail.dosageInstructions.length > 0 ? (
        <div className="rounded-xl border border-border p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Directions
          </p>
          <ul className="space-y-1 text-sm text-accent-foreground">
            {detail.dosageInstructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Field label="Reason" value={detail.reason} />
        <Field label="Prescriber" value={detail.prescriberName} />
        <Field label="Prescribed" value={formatDate(detail.authoredOn)} />
        <Field label="Quantity" value={detail.quantity} />
        <Field label="Supply" value={detail.expectedSupplyDuration} />
        <Field
          label="Repeats allowed"
          value={
            detail.repeatsAllowed !== undefined
              ? String(detail.repeatsAllowed)
              : undefined
          }
        />
        {detail.validityStart || detail.validityEnd ? (
          <Field
            label="Valid"
            value={`${formatDate(detail.validityStart)} – ${formatDate(detail.validityEnd)}`}
          />
        ) : null}
      </div>

      {detail.dispenses.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Dispensing history
          </p>
          <div className="space-y-2">
            {detail.dispenses.map((dispense) => (
              <DispenseRow key={dispense.id} dispense={dispense} />
            ))}
          </div>
        </div>
      ) : null}

      {detail.notes ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Notes
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{detail.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PrescriptionDetailDrawer({
  prescriptionId,
  open,
  onOpenChange,
}: {
  prescriptionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = usePrescriptionDetailQuery(
    open ? prescriptionId : null
  );

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <div className="mx-auto w-full max-w-md">
        <Drawer.Title className="sr-only">
          {data?.medication ?? 'Prescription'}
        </Drawer.Title>
        {isLoading ? <LoadingState label="Loading prescription..." /> : null}
        {isError ? (
          <ErrorState message="Could not load this prescription." />
        ) : null}
        {data ? <DetailBody detail={data} /> : null}
      </div>
    </ResponsiveDrawer>
  );
}
