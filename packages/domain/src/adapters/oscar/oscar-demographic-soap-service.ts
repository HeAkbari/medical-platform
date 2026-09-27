import { escapeXml, OscarSoapClient } from './oscar-soap-client';
import type { OscarSoapDemographicSearchResult } from './oscar-soap-types';

/**
 * Escapes SQL LIKE metacharacters (`%`, `_`) in a value before it's embedded
 * in a `%...%` search pattern — a last name that happens to contain either
 * character would otherwise match unrelated records.
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[%_]/g, (char) => `\\${char}`);
}

/**
 * `DemographicService.searchDemographicByName(pattern, offset, limit)` —
 * verified live (2026-09-26), see
 * docs/oscar/new-approach/oscar-verified-service-catalog.md. `lastName` is
 * wrapped in `%...%` (substring match, matching the verified sample) —
 * callers still need to confirm `firstName` themselves, since this only
 * searches on last name.
 */
export async function searchDemographicByName(
  client: OscarSoapClient,
  lastName: string,
  offset = 0,
  limit = 20
): Promise<OscarSoapDemographicSearchResult[]> {
  const pattern = `%${escapeLikePattern(lastName)}%`;
  const body = `<ws:searchDemographicByName><arg0>${escapeXml(pattern)}</arg0><arg1>${offset}</arg1><arg2>${limit}</arg2></ws:searchDemographicByName>`;
  const result = (await client.call('DemographicService', body)) as
    | { return?: unknown[] }
    | ''
    | null;

  const rows = result && typeof result === 'object' ? (result.return ?? []) : [];

  return rows
    .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
    .filter((row) => row.demographicNo != null)
    .map((row) => ({
      demographicNo: Number(row.demographicNo),
      firstName: typeof row.firstName === 'string' ? row.firstName : undefined,
      lastName: typeof row.lastName === 'string' ? row.lastName : undefined,
      displayName: typeof row.displayName === 'string' ? row.displayName : undefined,
      dateOfBirth: typeof row.dateOfBirth === 'string' ? row.dateOfBirth : undefined,
      monthOfBirth: typeof row.monthOfBirth === 'string' ? row.monthOfBirth : undefined,
      yearOfBirth: typeof row.yearOfBirth === 'string' ? row.yearOfBirth : undefined,
      hin: typeof row.hin === 'string' && row.hin ? row.hin : undefined,
      email: typeof row.email === 'string' && row.email ? row.email : undefined,
      phone: typeof row.phone === 'string' && row.phone ? row.phone : undefined,
      phone2: typeof row.phone2 === 'string' && row.phone2 ? row.phone2 : undefined,
      address: typeof row.address === 'string' && row.address ? row.address : undefined,
      city: typeof row.city === 'string' && row.city ? row.city : undefined,
      province: typeof row.province === 'string' && row.province ? row.province : undefined,
      postal: typeof row.postal === 'string' && row.postal ? row.postal : undefined,
      sex: typeof row.sex === 'string' ? row.sex : undefined,
      sexDesc: typeof row.sexDesc === 'string' ? row.sexDesc : undefined,
      patientStatus: typeof row.patientStatus === 'string' ? row.patientStatus : undefined,
      patientStatusDate:
        typeof row.patientStatusDate === 'string' ? row.patientStatusDate : undefined,
      providerNo: typeof row.providerNo === 'string' ? row.providerNo : undefined,
      activeCount: row.activeCount != null ? Number(row.activeCount) : undefined,
      hsAlertCount: row.hsAlertCount != null ? Number(row.hsAlertCount) : undefined,
      chartNo: typeof row.chartNo === 'string' ? row.chartNo : undefined,
    }));
}
