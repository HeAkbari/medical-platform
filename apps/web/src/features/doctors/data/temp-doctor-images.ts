/**
 * TEMP: local headshots for UI testing only.
 * Not stored in the database — delete with `apps/web/public/dr-images` later.
 */

const TEMP_IMAGES_BY_DOCTOR_ID: Record<string, string> = {
  // Emily Nguyen
  'd4e5f6a7-b8c9-0123-def0-234567890123': 'Emily Nguyen.png',
  // David Brooks
  'e5f6a7b8-c9d0-1234-ef01-345678901234': 'David Brooks.png',
  // Sarah Kim — no dedicated file yet; reuse closest temp asset
  'f6a7b8c9-d0e1-2345-f012-456789012345': 'Sara Ahmadi.png',
};

const TEMP_IMAGES_BY_NAME: Record<string, string> = {
  'emily nguyen': 'Emily Nguyen.png',
  'david brooks': 'David Brooks.png',
  'sarah kim': 'Sara Ahmadi.png',
  'sara ahmadi': 'Sara Ahmadi.png',
  'ali rezaei': 'Ali Rezaei.png',
};

function toPublicUrl(filename: string): string {
  return `/dr-images/${encodeURIComponent(filename)}`;
}

/** Returns a `/dr-images/...` URL when a temp asset exists; otherwise null. */
export function getTempDoctorImageUrl(input: {
  id?: string | null;
  firstName?: string;
  lastName?: string;
}): string | null {
  if (input.id) {
    const byId = TEMP_IMAGES_BY_DOCTOR_ID[input.id];
    if (byId) return toPublicUrl(byId);
  }

  const name = `${input.firstName ?? ''} ${input.lastName ?? ''}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (name) {
    const byName = TEMP_IMAGES_BY_NAME[name];
    if (byName) return toPublicUrl(byName);
  }

  return null;
}
