import type { FhirBundle } from './fhir-types';

export interface FhirClientConfig {
  /** FHIR base URL, e.g. http://localhost:8080/fhir */
  baseUrl: string;
  /** Optional bearer token for servers that require auth (OSCAR sandbox/prod). */
  token?: string;
  /** Override fetch (tests, custom agents). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

const FHIR_JSON = 'application/fhir+json';

export class FhirHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string
  ) {
    super(message);
    this.name = 'FhirHttpError';
  }
}

/** Thin wrapper over a FHIR REST endpoint. No resource-specific logic here. */
export class FhirClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: FhirClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.token;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: FHIR_JSON,
      ...extra,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private buildUrl(
    resourceType: string,
    idOrQuery?: string | Record<string, string | undefined>
  ): string {
    if (typeof idOrQuery === 'string') {
      return `${this.baseUrl}/${resourceType}/${idOrQuery}`;
    }

    const params = new URLSearchParams({ _format: 'json' });
    if (idOrQuery) {
      for (const [key, value] of Object.entries(idOrQuery)) {
        if (value !== undefined && value !== '') {
          params.set(key, value);
        }
      }
    }

    return `${this.baseUrl}/${resourceType}?${params.toString()}`;
  }

  /** Search a resource type, returning the entries of the result Bundle. */
  async search<T>(
    resourceType: string,
    query?: Record<string, string | undefined>
  ): Promise<T[]> {
    const response = await this.fetchImpl(this.buildUrl(resourceType, query), {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new FhirHttpError(
        `FHIR search ${resourceType} failed`,
        response.status,
        await safeText(response)
      );
    }

    const bundle = (await response.json()) as FhirBundle<T>;
    return (bundle.entry ?? [])
      .map((entry) => entry.resource)
      .filter((resource): resource is T => resource !== undefined);
  }

  /** Read a single resource by id, or null when the server returns 404. */
  async read<T>(resourceType: string, id: string): Promise<T | null> {
    const response = await this.fetchImpl(this.buildUrl(resourceType, id), {
      headers: this.headers(),
    });

    if (response.status === 404 || response.status === 410) {
      return null;
    }

    if (!response.ok) {
      throw new FhirHttpError(
        `FHIR read ${resourceType}/${id} failed`,
        response.status,
        await safeText(response)
      );
    }

    return (await response.json()) as T;
  }

  /** Create a resource (POST). Returns the server-stored representation. */
  async create<T>(resourceType: string, resource: T): Promise<T> {
    const response = await this.fetchImpl(
      `${this.baseUrl}/${resourceType}`,
      {
        method: 'POST',
        headers: this.headers({ 'Content-Type': FHIR_JSON }),
        body: JSON.stringify(resource),
      }
    );

    if (!response.ok) {
      throw new FhirHttpError(
        `FHIR create ${resourceType} failed`,
        response.status,
        await safeText(response)
      );
    }

    return (await response.json()) as T;
  }
}

async function safeText(response: Response): Promise<string | undefined> {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}
