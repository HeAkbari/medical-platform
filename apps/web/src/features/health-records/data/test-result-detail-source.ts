import {
  FhirClient,
  referenceId,
  type FhirDiagnosticReport,
  type FhirObservation,
} from '@medical-platform/domain';
import type {
  LabReportSummary,
  LabResultDetail,
  LabResultValueDetail,
} from './health-record-types';
import { conceptLabel, formatQuantity, formatRange } from './fhir-format';

function buildValues(observation: FhirObservation): LabResultValueDetail[] {
  if (observation.component && observation.component.length > 0) {
    return observation.component
      .map((component): LabResultValueDetail | null => {
        const value =
          formatQuantity(component.valueQuantity) ?? component.valueString;
        if (value === undefined) {
          return null;
        }
        return {
          label: conceptLabel(component.code),
          value,
          referenceRange: formatRange(component.referenceRange?.[0]),
          interpretation: conceptLabel(component.interpretation?.[0]),
        };
      })
      .filter((value): value is LabResultValueDetail => value !== null);
  }

  const value =
    formatQuantity(observation.valueQuantity) ?? observation.valueString;
  return value === undefined ? [] : [{ value }];
}

function buildReport(report?: FhirDiagnosticReport): LabReportSummary | undefined {
  if (!report) {
    return undefined;
  }
  return {
    id: report.id ?? '',
    code: conceptLabel(report.code),
    status: report.status,
    conclusion: report.conclusion,
    issued: report.issued ?? report.effectiveDateTime,
    performer: report.performer?.[0]?.display,
  };
}

/**
 * Loads one lab result with its richer detail: the full `Observation` plus the
 * `DiagnosticReport` that groups it (conclusion, reporting lab).
 */
export async function loadTestResultDetail(
  id: string
): Promise<LabResultDetail | null> {
  if (process.env.DATA_SOURCE !== 'fhir') {
    return null;
  }

  const client = new FhirClient({
    baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
    token: process.env.FHIR_TOKEN,
  });

  const observation = await client.read<FhirObservation>('Observation', id);
  if (!observation) {
    return null;
  }

  const reports = await client.search<FhirDiagnosticReport>('DiagnosticReport', {
    result: `Observation/${id}`,
  });

  return {
    id: observation.id ?? id,
    name: conceptLabel(observation.code) ?? 'Result',
    status: observation.status ?? 'unknown',
    category: conceptLabel(observation.category?.[0]),
    effectiveDate: observation.effectiveDateTime ?? observation.issued,
    issued: observation.issued,
    performer: observation.performer?.[0]?.display,
    values: buildValues(observation),
    referenceRange: formatRange(observation.referenceRange?.[0]),
    interpretation: conceptLabel(observation.interpretation?.[0]),
    notes:
      observation.note
        ?.map((note) => note.text)
        .filter(Boolean)
        .join(' ') || undefined,
    patientId: referenceId(observation.subject?.reference),
    report: buildReport(reports[0]),
  };
}
