import { listResponse } from '@/lib/api-response';
import { patientService } from '@/lib/server-services';

export async function GET() {
  const patients = await patientService.list();
  return listResponse(patients);
}
