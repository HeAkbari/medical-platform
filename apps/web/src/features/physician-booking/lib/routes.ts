/** Patient booking flow for a specific physician (P10). */
export function getPhysicianBookingHref(doctorId: string): string {
  return `/physicians/${doctorId}/book`;
}
