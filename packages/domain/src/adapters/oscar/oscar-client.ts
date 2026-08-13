import { createHmac } from 'node:crypto';
import OAuth from 'oauth-1.0a';
import { Agent as UndiciAgent } from 'undici';

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

// fetch's DOM types don't know about these — `dispatcher` is undici's
// (Node's built-in fetch) way to plug in a custom TLS-relaxed agent, `tls`
// is Bun's equivalent for its own fetch implementation. Setting both covers
// dev (Bun) and production (Node, see deploy/Dockerfile) without needing to
// detect the runtime.
type FetchInitWithInsecureTls = RequestInit & {
  dispatcher?: unknown;
  tls?: { rejectUnauthorized?: boolean };
};

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

export class OscarClient {
  private readonly oauth: OAuth;
  private readonly token: OAuth.Token;
  private readonly insecureDispatcher: UndiciAgent | undefined;

  constructor(private readonly config: OscarClientConfig) {
    this.oauth = new OAuth({
      consumer: { key: config.consumerKey, secret: config.consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString, key) =>
        createHmac('sha1', key).update(baseString).digest('base64'),
    });
    this.token = { key: config.accessToken, secret: config.accessTokenSecret };
    this.insecureDispatcher = config.allowSelfSignedCert
      ? new UndiciAgent({ connect: { rejectUnauthorized: false } })
      : undefined;
  }

  async get(path: string, query?: Record<string, string>): Promise<unknown> {
    return this.request('GET', path, query);
  }

  async post(path: string, body?: unknown, query?: Record<string, string>): Promise<unknown> {
    return this.request('POST', path, query, body);
  }

  async put(path: string, body?: unknown, query?: Record<string, string>): Promise<unknown> {
    return this.request('PUT', path, query, body);
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
    query?: Record<string, string>,
    body?: unknown
  ): Promise<unknown> {
    const url = this.buildUrl(path, query);
    const authHeader = this.oauth.toHeader(
      this.oauth.authorize({ url, method }, this.token)
    );

    const init: FetchInitWithInsecureTls = {
      method,
      headers: {
        ...authHeader,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      ...(this.insecureDispatcher
        ? { dispatcher: this.insecureDispatcher, tls: { rejectUnauthorized: false } }
        : {}),
    };

    const attempt = async (): Promise<Response> => fetch(url, init);

    let response: Response;

    try {
      response = await attempt();
    } catch {
      // One retry for transient network errors — not for auth failures,
      // since these OAuth1 keys are long-lived, not expiring session tokens.
      response = await attempt();
    }

    const responseBody = await response.text();

    if (!response.ok) {
      throw new OscarHttpError(
        response.status,
        responseBody,
        `OSCAR request failed: ${method} ${path} -> ${response.status}`
      );
    }

    return responseBody ? JSON.parse(responseBody) : null;
  }
}
