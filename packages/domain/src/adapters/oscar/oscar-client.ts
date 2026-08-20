import { createHmac } from 'node:crypto';
import { Agent as HttpsAgent, request as httpsRequest } from 'node:https';
import OAuth from 'oauth-1.0a';

export interface OscarClientConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  /**
   * Skip TLS certificate verification for this clinic's connection — only
   * for OSCAR installs known to serve a self-signed cert (e.g. the sponsor
   * clinic's sandbox). Never set for a clinic reachable over the public
   * internet with a real cert; this disables MITM protection.
   */
  allowSelfSignedCert?: boolean;
}

export interface OscarRequestOptions {
  query?: Record<string, string>;
}

export class OscarHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message: string
  ) {
    super(message);
    this.name = 'OscarHttpError';
  }
}

interface RawHttpsResponse {
  status: number;
  body: string;
}

// A relaxed-TLS agent is reused across requests for this client (cheap,
// keeps connection pooling working) — only ever constructed when the clinic
// is explicitly configured with allowSelfSignedCert.
function performHttpsRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: string | undefined,
  agent: HttpsAgent | undefined
): Promise<RawHttpsResponse> {
  return new Promise((resolve, reject) => {
    const target = new URL(url);

    const req = httpsRequest(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || 443,
        path: `${target.pathname}${target.search}`,
        method,
        headers,
        agent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
        res.on('error', reject);
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

export class OscarClient {
  private readonly oauth: OAuth;
  private readonly token: OAuth.Token;
  // Using node:https directly instead of fetch: fetch's runtime-specific TLS
  // extensions (Bun's `tls` option, a custom undici `dispatcher`) turned out
  // not to be portable — verified live, one worked under Bun but not inside
  // Next.js's own fetch instrumentation, the other silently did nothing under
  // Node. https.Agent is a stable, version-independent way to relax TLS
  // verification for one clinic's connection specifically.
  private readonly httpsAgent: HttpsAgent | undefined;

  constructor(private readonly config: OscarClientConfig) {
    this.oauth = new OAuth({
      consumer: { key: config.consumerKey, secret: config.consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString, key) =>
        createHmac('sha1', key).update(baseString).digest('base64'),
    });
    this.token = { key: config.accessToken, secret: config.accessTokenSecret };
    this.httpsAgent = config.allowSelfSignedCert
      ? new HttpsAgent({ rejectUnauthorized: false })
      : undefined;
  }

  async get(path: string, options?: OscarRequestOptions): Promise<unknown> {
    return this.request('GET', path, options);
  }

  async post(path: string, body?: unknown, options?: OscarRequestOptions): Promise<unknown> {
    return this.request('POST', path, options, body);
  }

  async put(path: string, body?: unknown, options?: OscarRequestOptions): Promise<unknown> {
    return this.request('PUT', path, options, body);
  }

  private buildUrl(path: string, query?: Record<string, string>): string {
    const url = new URL(`${this.config.baseUrl.replace(/\/$/, '')}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }

    return url.toString();
  }

  private async request(
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    options?: OscarRequestOptions,
    body?: unknown
  ): Promise<unknown> {
    const url = this.buildUrl(path, options?.query);
    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({ url, method }, this.token)
    );

    const headers: Record<string, string> = {
      ...authHeader,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    };
    const requestBody = body ? JSON.stringify(body) : undefined;

    const attempt = (): Promise<RawHttpsResponse> =>
      performHttpsRequest(url, method, headers, requestBody, this.httpsAgent);

    let response: RawHttpsResponse;

    try {
      response = await attempt();
    } catch {
      // One retry for transient network errors — not for auth failures,
      // since these OAuth1 keys are long-lived, not expiring session tokens.
      response = await attempt();
    }

    if (response.status < 200 || response.status >= 300) {
      throw new OscarHttpError(
        response.status,
        response.body,
        `OSCAR request failed: ${method} ${path} -> ${response.status}`
      );
    }

    if (!response.body) {
      return null;
    }

    return JSON.parse(response.body);
  }
}
