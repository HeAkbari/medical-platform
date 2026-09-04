import { Agent as HttpsAgent, request as httpsRequest } from 'node:https';

export interface RawHttpsResponse {
  status: number;
  body: string;
}

/**
 * Shared by OscarClient (REST/OAuth1) and OscarSoapClient (SOAP/WS-Security) —
 * both clinic connections need the same node:https-based request (not
 * `fetch`) and the same optional self-signed-cert relaxation. See
 * OscarClient's constructor comment for why node:https specifically.
 */
export function performHttpsRequest(
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
