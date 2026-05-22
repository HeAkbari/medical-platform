import { listResponse } from '@/shared/lib/api-response';
import { patientService } from '@/shared/lib/server-services';

export async function GET() {
  const patients = await patientService.list();
  return listResponse(patients);
}
