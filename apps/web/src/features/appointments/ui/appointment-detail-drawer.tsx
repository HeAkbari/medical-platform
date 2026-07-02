'use client';

import { Drawer } from 'vaul';
import {
  Badge,
  Button,
  ErrorState,
  LoadingState,
  ResponsiveDrawer,
} from '@/components/ui';
import {
  useAppointmentDetailQuery,
  useCancelAppointmentMutation,
} from '../hooks/use-appointment-detail';
import type { AppointmentDetail } from '../data/appointment-detail';

function statusVariant(status: string) {
  if (status === 'completed') {
    return 'success' as const;
  }
  if (status === 'cancelled') {
    return 'muted' as const;
  }
  return 'default' as const;
}

function formatDateTime(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatTime(value?: string): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailBody({
  detail,
  onCancel,
  isCancelling,
}: {
  detail: AppointmentDetail;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const when = `${formatDateTime(detail.scheduledAt)}${
    detail.endAt ? ` – ${formatTime(detail.endAt)}` : ''
  }`;
  const canCancel = detail.status === 'scheduled';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {detail.reason || detail.serviceType || 'Appointment'}
          </h3>
          {detail.appointmentType ? (
            <p className="mt-0.5 text-sm text-faint-foreground">
              {detail.appointmentType}
            </p>
          ) : null}
        </div>
        <Badge variant={statusVariant(detail.status)}>
          {detail.fhirStatus ?? detail.status}
        </Badge>
      </div>

      <Section title="When">
        <Field label="Date & time" value={when} />
        <Field label="Duration" value={`${detail.durationMinutes} min`} />
        {detail.priority ? <Field label="Priority" value={detail.priority} /> : null}
      </Section>

      {detail.doctor || detail.patientName ? (
        <Section title="Who">
          <Field label="Patient" value={detail.patientName} />
          <Field label="Practitioner" value={detail.doctor?.name} />
          <Field label="Specialty" value={detail.doctor?.specialty} />
          <Field label="Contact" value={detail.doctor?.phone} />
        </Section>
      ) : null}

      {detail.location ? (
        <Section title="Where">
          <Field label="Clinic" value={detail.location.name} />
          <Field label="Address" value={detail.location.address} />
          <Field label="Phone" value={detail.location.phone} />
        </Section>
      ) : null}

      <Section title="Details">
        <Field label="Service" value={detail.serviceType} />
        <Field label="Category" value={detail.serviceCategory} />
        <Field label="Specialty" value={detail.specialty} />
        <Field label="Reason" value={detail.reasonText} />
        <Field label="Booked on" value={formatDateTime(detail.created)} />
      </Section>

      {detail.comment ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint-foreground">
            Comment
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{detail.comment}</p>
        </div>
      ) : null}

      {detail.patientInstruction ? (
        <div className="rounded-xl border border-brand-subtle/60 bg-brand-muted/40 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-dark">
            Instructions
          </p>
          <p className="text-sm leading-6 text-accent-foreground">
            {detail.patientInstruction}
          </p>
        </div>
      ) : null}

      {canCancel ? (
        <Button
          variant="secondary"
          fullWidth
          disabled={isCancelling}
          onClick={onCancel}
        >
          {isCancelling ? 'Cancelling…' : 'Cancel appointment'}
        </Button>
      ) : null}
    </div>
  );
}

export function AppointmentDetailDrawer({
  appointmentId,
  open,
  onOpenChange,
}: {
  appointmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, isError } = useAppointmentDetailQuery(
    open ? appointmentId : null
  );
  const cancelMutation = useCancelAppointmentMutation();

  function handleCancel() {
    if (!appointmentId) {
      return;
    }
    cancelMutation.mutate(appointmentId, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <div className="mx-auto w-full max-w-md">
        <Drawer.Title className="sr-only">
          {data?.reason ?? 'Appointment'}
        </Drawer.Title>
        {isLoading ? <LoadingState label="Loading appointment..." /> : null}
        {isError ? (
          <ErrorState message="Could not load this appointment." />
        ) : null}
        {data ? (
          <DetailBody
            detail={data}
            onCancel={handleCancel}
            isCancelling={cancelMutation.isPending}
          />
        ) : null}
      </div>
    </ResponsiveDrawer>
  );
}
