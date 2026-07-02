import { Suspense } from 'react';
import { LoadingState } from '@/components/ui';
import { FindPhysicianPage } from '@/features/app-home/ui/find-physician-page';

export default function FindPhysicianRoutePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading physicians..." />}>
      <FindPhysicianPage />
    </Suspense>
  );
}
