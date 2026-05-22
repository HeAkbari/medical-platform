import {
  jsonResponse,
  notFoundResponse,
} from '@/shared/lib/api-response';
import { doctorService } from '@/shared/lib/server-services';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const doctor = await doctorService.getById(id);

  if (!doctor) {
    return notFoundResponse('Doctor');
  }

  return jsonResponse({ data: doctor });
}
