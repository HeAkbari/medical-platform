import { internalErrorResponse, listResponse } from '@/lib/api-response';
import { loadHealthRecords } from '@/features/health-records/data/health-conditions-source';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId') ?? undefined;
    const records = await loadHealthRecords(patientId);
    return listResponse(records);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load health records';
    return internalErrorResponse(message);
  }
}
