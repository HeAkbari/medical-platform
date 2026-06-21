import { internalErrorResponse, listResponse } from '@/lib/api-response';
import { loadTestResults } from '@/features/health-records/data/test-results-source';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId') ?? undefined;
    const results = await loadTestResults(patientId);
    return listResponse(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load test results';
    return internalErrorResponse(message);
  }
}
