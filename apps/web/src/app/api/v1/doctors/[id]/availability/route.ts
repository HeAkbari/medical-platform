import { badRequestResponse, jsonResponse } from '@/lib/api-response';
import { getAvailableSlots, getWorkingDaysInMonth } from '@/lib/doctors/availability';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Two modes on one route:
 * - `?year=&month=` -> which days of that month have a real work schedule (live SOAP, one call per day).
 * - `?date=YYYY-MM-DD` -> real available slot start times for that day (live SOAP + REST booked-appointment check).
 *
 * `month` on the wire is 1-indexed (month=8 means August) — human-friendly,
 * matches every other date-ish thing in this API (`date=YYYY-MM-DD` is
 * already 1-indexed within the string). Only converted to JS `Date`'s
 * 0-indexed convention right here, at the boundary; every internal caller
 * (getWorkingDaysInMonth, the frontend's own calendar state) stays 0-indexed.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const visitType = searchParams.get('visitType');

  if (!visitType) {
    return badRequestResponse('?visitType= is required (e.g. walkIn, phone, virtual).');
  }

  if (date) {
    const slots = await getAvailableSlots(id, date, visitType);
    return jsonResponse({ data: { date, slots } });
  }

  const year = Number(searchParams.get('year'));
  const month1Indexed = Number(searchParams.get('month'));

  if (!Number.isInteger(year) || !Number.isInteger(month1Indexed)) {
    return badRequestResponse('Provide either ?date=YYYY-MM-DD or ?year=&month= (1-indexed, e.g. month=8 for August).');
  }

  const workingDays = await getWorkingDaysInMonth(id, year, month1Indexed - 1, visitType);
  return jsonResponse({ data: { year, month: month1Indexed, workingDays } });
}
