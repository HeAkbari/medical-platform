import { jsonResponse, notFoundResponse } from '@/lib/api-response';
import { PrismaDoctorDirectoryRepository } from '@/lib/doctors/repository';

const doctorDirectory = new PrismaDoctorDirectoryRepository();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const doctor = await doctorDirectory.findById(id);

  if (!doctor) {
    return notFoundResponse('Doctor');
  }

  return jsonResponse({ data: doctor });
}
