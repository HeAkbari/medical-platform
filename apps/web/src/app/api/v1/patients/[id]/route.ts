import { jsonResponse, notFoundResponse } from '@/lib/api-response';
import { patientService } from '@/lib/server-services';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const patient = await patientService.getById(id);

  if (!patient) {
    return notFoundResponse('Patient');
  }

  return jsonResponse({ data: patient });
}
