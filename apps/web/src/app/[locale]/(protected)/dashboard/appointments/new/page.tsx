import { Suspense } from 'react';
import { NewAppointmentForm } from '@/features/appointments';
import { LoadingState } from '@/components/ui';

export default function NewAppointmentRoutePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading form..." />}>
      <NewAppointmentForm />
    </Suspense>
  );
}
