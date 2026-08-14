import { repositories } from '@/lib/repositories';
import type { AppointmentDetail } from './appointment-detail';

/**
 * Loads one appointment enriched with its doctor/location — delegates
 * entirely to whichever AppointmentRepository is active (mock/fhir/oscar),
 * per docs/oscar/new-approach/docs-oscar-new-approach.md §1/§7.
 */
export async function loadAppointmentDetail(id: string): Promise<AppointmentDetail | null> {
  return repositories.appointments.findDetailById(id);
}
