import {
  referenceId,
  type FhirCodeableConcept,
  type FhirObservation,
  type FhirObservationReferenceRange,
  type FhirQuantity,
} from '@medical-platform/domain';
import type { LabResult, LabResultValue } from './health-record-types';

function conceptLabel(concept?: FhirCodeableConcept): string | undefined {
  return concept?.text ?? concept?.coding?.[0]?.display ?? concept?.coding?.[0]?.code;
}

function formatQuantity(quantity?: FhirQuantity): string | undefined {
  if (quantity?.value === undefined) {
    return undefined;
  }
  return quantity.unit
    ? `${quantity.value} ${quantity.unit}`
    : String(quantity.value);
}

function formatRange(range?: FhirObservationReferenceRange): string | undefined {
  if (!range) {
    return undefined;
  }
  if (range.text) {
    return range.text;
  }
  const low = formatQuantity(range.low);
  const high = formatQuantity(range.high);
  if (low && high) {
    return `${low} – ${high}`;
  }
  return low ?? high;
}

export function fhirObservationToLabResult(
  resource: FhirObservation
): LabResult {
  const values: LabResultValue[] = [];

  if (resource.component && resource.component.length > 0) {
    for (const component of resource.component) {
      const value =
        formatQuantity(component.valueQuantity) ?? component.valueString;
      if (value !== undefined) {
        values.push({ label: conceptLabel(component.code), value });
      }
    }
  } else {
    const value = formatQuantity(resource.valueQuantity) ?? resource.valueString;
    if (value !== undefined) {
      values.push({ value });
    }
  }

  return {
    id: resource.id ?? '',
    name: conceptLabel(resource.code) ?? 'Result',
    status: resource.status ?? 'unknown',
    category: conceptLabel(resource.category?.[0]),
    effectiveDate: resource.effectiveDateTime ?? resource.issued,
    values,
    referenceRange: formatRange(resource.referenceRange?.[0]),
    interpretation: conceptLabel(resource.interpretation?.[0]),
    notes: resource.note?.map((note) => note.text).filter(Boolean).join(' ') || undefined,
    patientId: referenceId(resource.subject?.reference),
  };
}
