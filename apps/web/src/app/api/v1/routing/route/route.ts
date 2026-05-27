import {
  badRequestResponse,
  internalErrorResponse,
  jsonResponse,
} from '@/lib/api-response';
import type { MapRoute } from '@/features/map/types';
import type { NextRequest } from 'next/server';

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

function parseCoordinate(value: string | null, label: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const originLat = parseCoordinate(searchParams.get('originLat'), 'originLat');
  const originLng = parseCoordinate(searchParams.get('originLng'), 'originLng');
  const destLat = parseCoordinate(searchParams.get('destLat'), 'destLat');
  const destLng = parseCoordinate(searchParams.get('destLng'), 'destLng');

  if (
    originLat === null ||
    originLng === null ||
    destLat === null ||
    destLng === null
  ) {
    return badRequestResponse('Origin and destination coordinates are required');
  }

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(osrmUrl);

    if (!response.ok) {
      return internalErrorResponse('Routing service is unavailable');
    }

    const payload = (await response.json()) as OsrmRouteResponse;
    const selectedRoute = payload.routes?.[0];

    if (payload.code !== 'Ok' || !selectedRoute) {
      return badRequestResponse('No route found between these locations');
    }

    const route: MapRoute = {
      coordinates: selectedRoute.geometry.coordinates.map(
        ([longitude, latitude]) => [latitude, longitude]
      ),
      distanceMeters: selectedRoute.distance,
      durationSeconds: selectedRoute.duration,
    };

    return jsonResponse({ data: route });
  } catch {
    return internalErrorResponse('Unable to calculate route');
  }
}
