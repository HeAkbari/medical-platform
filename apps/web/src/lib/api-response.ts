import { createApiError } from '@medical-platform/domain';

export function jsonResponse<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function listResponse<T>(data: T[]) {
  return jsonResponse({ data, total: data.length });
}

export function notFoundResponse(resource: string): Response {
  return jsonResponse(createApiError(`${resource} not found`, 'NOT_FOUND'), 404);
}

export function badRequestResponse(message: string): Response {
  return jsonResponse(createApiError(message, 'BAD_REQUEST'), 400);
}

export function internalErrorResponse(message: string): Response {
  return jsonResponse(createApiError(message, 'INTERNAL_ERROR'), 500);
}
