import { internalErrorResponse, listResponse } from '@/lib/api-response';
import { loadVaccinations } from '@/features/health-records/data/vaccinations-source';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId') ?? undefined;
    const vaccinations = await loadVaccinations(patientId);
    return listResponse(vaccinations);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load vaccinations';
    return internalErrorResponse(message);
  }
}
