import { internalErrorResponse, listResponse } from '@/lib/api-response';
import { loadFacilities } from '@/features/map/data/facilities-source';

export async function GET() {
  try {
    const facilities = await loadFacilities();
    return listResponse(facilities);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load facilities';
    return internalErrorResponse(message);
  }
}
