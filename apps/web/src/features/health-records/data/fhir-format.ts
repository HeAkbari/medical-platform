import type {
  FhirCodeableConcept,
  FhirObservationReferenceRange,
  FhirQuantity,
} from '@medical-platform/domain';

export function conceptLabel(
  concept?: FhirCodeableConcept
): string | undefined {
  return (
    concept?.text ?? concept?.coding?.[0]?.display ?? concept?.coding?.[0]?.code
  );
}

export function formatQuantity(quantity?: FhirQuantity): string | undefined {
  if (quantity?.value === undefined) {
    return undefined;
  }
  return quantity.unit
    ? `${quantity.value} ${quantity.unit}`
    : String(quantity.value);
}

export function formatRange(
  range?: FhirObservationReferenceRange
): string | undefined {
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
