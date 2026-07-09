import { PhysicianInfoPage } from '@/features/physician-info/ui/physician-info-page';

interface PhysicianInfoRouteProps {
  params: Promise<{ id: string }>;
}

export default async function PhysicianInfoRoute({ params }: PhysicianInfoRouteProps) {
  const { id } = await params;
  return <PhysicianInfoPage doctorId={id} />;
}
