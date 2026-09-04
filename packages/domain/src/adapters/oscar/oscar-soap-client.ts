import { Agent as HttpsAgent } from 'node:https';
import { XMLParser } from 'fast-xml-parser';
import { performHttpsRequest } from './oscar-https';

/**
 * OSCAR's legacy SOAP web services (LoginService, ScheduleService,
 * BookingService, ...) — a completely separate integration surface from the
 * REST/OAuth1 API (OscarClient), used only for the doctor day-schedule
 * template, which has no REST equivalent. See
 * docs/oscar/new-approach/oscar-soap-schedule-services.md for the full
 * discovery writeup (auth quirks, verified request/response samples).
 */

export interface OscarSoapClientConfig {
  /** Same REST base URL as OscarClientConfig (e.g. `https://<host>:8443/oscar/ws/services`) — the `/services` suffix is stripped to derive each SOAP service's URL. */
  restBaseUrl: string;
  securityId: string;
  securityTokenKey: string;
  allowSelfSignedCert?: boolean;
}

export type OscarSoapService = 'LoginService' | 'ScheduleService' | 'BookingService';

export class OscarSoapFaultError extends Error {
  constructor(
    public readonly faultCode: string,
    public readonly faultString: string
  ) {
    super(`OSCAR SOAP fault: ${faultCode} — ${faultString}`);
    this.name = 'OscarSoapFaultError';
  }
}

// Verified live (2026-09-01) — NOT the URL a naive reading of the OASIS spec
// name would suggest. See oscar-soap-schedule-services.md for the exact
// wrong variant that produced a silent, misleading FailedAuthentication
// fault for every credential/format combination until this was found.
const PASSWORD_TEXT_TYPE =
  'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText';

const xmlParser = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: false,
  // `return` repeats for list-shaped responses (getScheduleTemplateCodes);
  // `timeSlots` repeats within a single getDayWorkSchedule response. Forcing
  // both to always parse as arrays (even a single element) keeps callers
  // from having to special-case "one result vs many".
  isArray: (name) => name === 'return' || name === 'timeSlots',
});

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class OscarSoapClient {
  private readonly soapBaseUrl: string;
  private readonly httpsAgent: HttpsAgent | undefined;

  constructor(private readonly config: OscarSoapClientConfig) {
    this.soapBaseUrl = config.restBaseUrl.replace(/\/services\/?$/, '');
    this.httpsAgent = config.allowSelfSignedCert
      ? new HttpsAgent({ rejectUnauthorized: false })
      : undefined;
  }

  /**
   * `operationXml` is the raw `<ws:operationName>...</ws:operationName>`
   * body — callers build this per-operation (see oscar-schedule-service.ts)
   * since each operation's argument shape differs and there's no schema
   * validation layer here (matches how OscarClient callers build their own
   * JSON bodies).
   */
  async call(
    service: OscarSoapService,
    operationXml: string,
    options?: { withAuth?: boolean }
  ): Promise<unknown> {
    const withAuth = options?.withAuth ?? true;
    const url = `${this.soapBaseUrl}/${service}`;

    const securityHeader = withAuth
      ? `<wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>${escapeXml(this.config.securityId)}</wsse:Username>
        <wsse:Password Type="${PASSWORD_TEXT_TYPE}">${escapeXml(this.config.securityTokenKey)}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>`
      : '';

    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:ws="http://ws.oscarehr.org/"
    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soapenv:Header>${securityHeader}</soapenv:Header>
  <soapenv:Body>
    ${operationXml}
  </soapenv:Body>
</soapenv:Envelope>`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/xml; charset=UTF-8',
      SOAPAction: '""',
    };

    const attempt = () =>
      performHttpsRequest(url, 'POST', headers, envelope, this.httpsAgent);

    let response;

    try {
      response = await attempt();
    } catch {
      // One retry for transient network errors, matching OscarClient — these
      // credentials are long-lived (verified stable across calls), not
      // expiring session tokens, so a retry never needs fresh auth.
      response = await attempt();
    }

    const parsed = xmlParser.parse(response.body) as Record<string, unknown>;
    const envelopeOut = (parsed.Envelope ?? parsed) as Record<string, unknown>;
    const bodyOut = envelopeOut?.Body as Record<string, unknown> | undefined;
    const fault = bodyOut?.Fault as
      | { faultcode?: unknown; faultstring?: unknown }
      | undefined;

    if (fault) {
      throw new OscarSoapFaultError(
        String(fault.faultcode ?? 'unknown'),
        String(fault.faultstring ?? 'unknown')
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `OSCAR SOAP request failed: ${service} -> HTTP ${response.status} (no SOAP Fault body found)`
      );
    }

    // Body has exactly one other key: the `<ws:operationNameResponse>`
    // element (namespace-stripped by the parser above).
    const responseKey = Object.keys(bodyOut ?? {})[0];
    return responseKey ? (bodyOut as Record<string, unknown>)[responseKey] : null;
  }
}
