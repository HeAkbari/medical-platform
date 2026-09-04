/**
 * OSCAR has no reliable timezone info for its schedule/appointment data, so
 * the domain layer encodes clinic wall-clock time using a `Z`-suffixed ISO
 * string that is NOT real UTC (see docs/oscar/new-approach/oscar-soap-schedule-services.md).
 * Formatting these with the viewer's local timezone would shift the displayed
 * hour by the browser's UTC offset. Forcing `timeZone: 'UTC'` reads the encoded
 * wall-clock fields verbatim, which is what should actually be shown to the
 * patient (the clinic's own local time, not the viewer's).
 */
export function formatClinicTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

export function formatClinicDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { timeZone: 'UTC' });
}
