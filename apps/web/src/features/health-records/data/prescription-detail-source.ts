import {
  FhirClient,
  referenceId,
  type FhirMedicationDispense,
  type FhirMedicationRequest,
  type FhirPractitioner,
} from '@medical-platform/domain';
import type {
  PrescriptionDetail,
  PrescriptionDispense,
} from './health-record-types';
import { conceptLabel, formatQuantity } from './fhir-format';

function practitionerName(
  practitioner?: FhirPractitioner | null
): string | undefined {
  const name = practitioner?.name?.[0];
  if (!name) {
    return undefined;
  }
  return [name.prefix?.join(' '), name.given?.join(' '), name.family]
    .filter(Boolean)
    .join(' ');
}

function mapDispense(dispense: FhirMedicationDispense): PrescriptionDispense {
  return {
    id: dispense.id ?? '',
    status: dispense.status,
    quantity: formatQuantity(dispense.quantity),
    daysSupply: formatQuantity(dispense.daysSupply),
    handedOver: dispense.whenHandedOver,
    pharmacy: dispense.performer?.[0]?.actor?.display,
  };
}

/**
 * Loads one prescription with its richer detail: the full `MedicationRequest`,
 * the prescriber (`Practitioner`), and any `MedicationDispense` history.
 */
export async function loadPrescriptionDetail(
  id: string
): Promise<PrescriptionDetail | null> {
  if (process.env.DATA_SOURCE !== 'fhir') {
    return null;
  }

  const client = new FhirClient({
    baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
    token: process.env.FHIR_TOKEN,
  });

  const request = await client.read<FhirMedicationRequest>(
    'MedicationRequest',
    id
  );
  if (!request) {
    return null;
  }

  const prescriberId = referenceId(request.requester?.reference);

  const [dispenses, prescriber] = await Promise.all([
    client.search<FhirMedicationDispense>('MedicationDispense', {
      prescription: `MedicationRequest/${id}`,
    }),
    // Prefer the inline display; only fetch the Practitioner when missing.
    request.requester?.display || !prescriberId
      ? Promise.resolve(null)
      : client.read<FhirPractitioner>('Practitioner', prescriberId),
  ]);

  return {
    id: request.id ?? id,
    medication: conceptLabel(request.medicationCodeableConcept) ?? 'Medication',
    status: request.status ?? 'unknown',
    authoredOn: request.authoredOn,
    dosageInstructions: (request.dosageInstruction ?? [])
      .map((dosage) => dosage.text ?? dosage.patientInstruction)
      .filter((text): text is string => Boolean(text)),
    reason: conceptLabel(request.reasonCode?.[0]),
    courseOfTherapy: conceptLabel(request.courseOfTherapyType),
    prescriberName: request.requester?.display ?? practitionerName(prescriber),
    prescriberId: prescriberId || undefined,
    patientId: referenceId(request.subject?.reference),
    quantity: formatQuantity(request.dispenseRequest?.quantity),
    expectedSupplyDuration: formatQuantity(
      request.dispenseRequest?.expectedSupplyDuration
    ),
    validityStart: request.dispenseRequest?.validityPeriod?.start,
    validityEnd: request.dispenseRequest?.validityPeriod?.end,
    repeatsAllowed: request.dispenseRequest?.numberOfRepeatsAllowed,
    notes:
      request.note
        ?.map((note) => note.text)
        .filter(Boolean)
        .join(' ') || undefined,
    dispenses: dispenses.map(mapDispense),
  };
}
