export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function isSameDay(isoDate: string, day: string): boolean {
  return isoDate.startsWith(day);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function createApiError(message: string, code: string) {
  return { message, code };
}
