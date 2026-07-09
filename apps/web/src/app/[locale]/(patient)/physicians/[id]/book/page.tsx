import { PhysicianBookingPage } from '@/features/physician-booking/ui/physician-booking-page';

interface PhysicianBookingRouteProps {
  params: Promise<{ id: string }>;
}

export default async function PhysicianBookingRoute({ params }: PhysicianBookingRouteProps) {
  const { id } = await params;
  return <PhysicianBookingPage doctorId={id} />;
}
