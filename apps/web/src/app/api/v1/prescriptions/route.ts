import { internalErrorResponse, listResponse } from '@/lib/api-response';
import { loadPrescriptions } from '@/features/health-records/data/prescriptions-source';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId') ?? undefined;
    const prescriptions = await loadPrescriptions(patientId);
    return listResponse(prescriptions);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load prescriptions';
    return internalErrorResponse(message);
  }
}
