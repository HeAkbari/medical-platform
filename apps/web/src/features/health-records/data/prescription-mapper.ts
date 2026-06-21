import {
  referenceId,
  type FhirCodeableConcept,
  type FhirMedicationRequest,
} from '@medical-platform/domain';
import type { Prescription } from './health-record-types';

function conceptLabel(concept?: FhirCodeableConcept): string | undefined {
  return concept?.text ?? concept?.coding?.[0]?.display ?? concept?.coding?.[0]?.code;
}

export function fhirMedicationRequestToPrescription(
  resource: FhirMedicationRequest
): Prescription {
  const dosageInstructions = (resource.dosageInstruction ?? [])
    .map((dosage) => dosage.text ?? dosage.patientInstruction)
    .filter((text): text is string => Boolean(text));

  return {
    id: resource.id ?? '',
    medication:
      conceptLabel(resource.medicationCodeableConcept) ?? 'Medication',
    status: resource.status ?? 'unknown',
    authoredOn: resource.authoredOn,
    dosageInstructions,
    repeatsAllowed: resource.dispenseRequest?.numberOfRepeatsAllowed,
    patientId: referenceId(resource.subject?.reference),
    prescriberId: referenceId(resource.requester?.reference) || undefined,
  };
}
