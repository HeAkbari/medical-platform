import { Suspense } from 'react';
import { NewAppointmentForm } from '@/features/appointments';
import { LoadingState } from '@/shared/ui';

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading form..." />}>
      <NewAppointmentForm />
    </Suspense>
  );
}
