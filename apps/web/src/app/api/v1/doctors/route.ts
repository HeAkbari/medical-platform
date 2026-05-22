import { listResponse } from '@/lib/api-response';
import { doctorService } from '@/lib/server-services';

export async function GET() {
  const doctors = await doctorService.list();
  return listResponse(doctors);
}
