import type { MapRoute } from '../types';

interface RouteApiResponse {
  data: MapRoute;
}

function parseCoordinate(value: string | null, label: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${label}`);
  }

  return parsed;
}

export async function fetchMapRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<MapRoute> {
  const [originLat, originLng] = origin;
  const [destinationLat, destinationLng] = destination;
  const params = new URLSearchParams({
    originLat: String(originLat),
    originLng: String(originLng),
    destLat: String(destinationLat),
    destLng: String(destinationLng),
  });

  const response = await fetch(`/api/v1/routing/route?${params.toString()}`);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? 'Unable to fetch route');
  }

  const body = (await response.json()) as RouteApiResponse;
  return body.data;
}
