import { listResponse } from '@/lib/api-response';
import { PrismaDoctorDirectoryRepository } from '@/lib/doctors/repository';

const doctorDirectory = new PrismaDoctorDirectoryRepository();

export async function GET() {
  const doctors = await doctorDirectory.findAll();
  return listResponse(doctors);
}
