import type {
  AllergyDetail,
  AllergyReactionDetail,
  ConditionDetail,
  DocumentDetail,
  DocumentRecord,
  HealthRecordEntry,
  LabReportSummary,
  LabResult,
  LabResultDetail,
  LabResultValueDetail,
  Prescription,
  PrescriptionDetail,
  PrescriptionDispense,
  Vaccination,
  VaccinationDetail,
} from '../../types/health-records';
import { referenceId } from './mappers';
import type {
  FhirAllergyIntolerance,
  FhirCodeableConcept,
  FhirCondition,
  FhirDiagnosticReport,
  FhirDocumentReference,
  FhirImmunization,
  FhirMedicationDispense,
  FhirMedicationRequest,
  FhirObservation,
  FhirObservationReferenceRange,
  FhirPractitioner,
  FhirQuantity,
} from './fhir-types';

function conceptLabel(concept?: FhirCodeableConcept): string | undefined {
  return concept?.text ?? concept?.coding?.[0]?.display ?? concept?.coding?.[0]?.code;
}

function formatQuantity(quantity?: FhirQuantity): string | undefined {
  if (quantity?.value === undefined) {
    return undefined;
  }

  return quantity.unit ? `${quantity.value} ${quantity.unit}` : String(quantity.value);
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

function notesFrom(note?: { text?: string }[]): string | undefined {
  return note?.map((entry) => entry.text).filter(Boolean).join(' ') || undefined;
}

// --- Prescriptions (MedicationRequest) ------------------------------------

export function fhirMedicationRequestToPrescription(
  resource: FhirMedicationRequest
): Prescription {
  const dosageInstructions = (resource.dosageInstruction ?? [])
    .map((dosage) => dosage.text ?? dosage.patientInstruction)
    .filter((text): text is string => Boolean(text));

  return {
    id: resource.id ?? '',
    medication: conceptLabel(resource.medicationCodeableConcept) ?? 'Medication',
    status: resource.status ?? 'unknown',
    authoredOn: resource.authoredOn,
    dosageInstructions,
    repeatsAllowed: resource.dispenseRequest?.numberOfRepeatsAllowed,
    patientId: referenceId(resource.subject?.reference),
    prescriberId: referenceId(resource.requester?.reference) || undefined,
  };
}

function practitionerName(practitioner?: FhirPractitioner | null): string | undefined {
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

export function fhirMedicationRequestToPrescriptionDetail(
  request: FhirMedicationRequest,
  dispenses: FhirMedicationDispense[],
  prescriber: FhirPractitioner | null
): PrescriptionDetail {
  const prescriberId = referenceId(request.requester?.reference);

  return {
    id: request.id ?? '',
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
    expectedSupplyDuration: formatQuantity(request.dispenseRequest?.expectedSupplyDuration),
    validityStart: request.dispenseRequest?.validityPeriod?.start,
    validityEnd: request.dispenseRequest?.validityPeriod?.end,
    repeatsAllowed: request.dispenseRequest?.numberOfRepeatsAllowed,
    notes: notesFrom(request.note),
    dispenses: dispenses.map(mapDispense),
  };
}

// --- Vaccinations (Immunization) ------------------------------------------

export function fhirImmunizationToVaccination(resource: FhirImmunization): Vaccination {
  return {
    id: resource.id ?? '',
    name: conceptLabel(resource.vaccineCode) ?? 'Vaccine',
    status: resource.status ?? 'unknown',
    date: resource.occurrenceDateTime,
    doseNumber: resource.protocolApplied?.[0]?.doseNumberPositiveInt,
    seriesDoses: resource.protocolApplied?.[0]?.seriesDosesPositiveInt,
    patientId: referenceId(resource.patient?.reference),
  };
}

export function fhirImmunizationToDetail(resource: FhirImmunization): VaccinationDetail {
  const protocol = resource.protocolApplied?.[0];

  return {
    ...fhirImmunizationToVaccination(resource),
    manufacturer: resource.manufacturer?.display,
    lotNumber: resource.lotNumber,
    expirationDate: resource.expirationDate,
    site: conceptLabel(resource.site),
    route: conceptLabel(resource.route),
    doseQuantity: formatQuantity(resource.doseQuantity),
    performer: resource.performer?.[0]?.actor?.display,
    targetDiseases: (protocol?.targetDisease ?? [])
      .map((disease) => conceptLabel(disease))
      .filter((label): label is string => Boolean(label)),
    notes: notesFrom(resource.note),
  };
}

// --- Condition --------------------------------------------------------------

export function fhirConditionToEntry(resource: FhirCondition): HealthRecordEntry {
  return {
    id: resource.id ?? '',
    kind: 'condition',
    name: conceptLabel(resource.code) ?? 'Condition',
    clinicalStatus: conceptLabel(resource.clinicalStatus),
    tag: conceptLabel(resource.severity),
    recordedDate: resource.recordedDate ?? resource.onsetDateTime,
    patientId: referenceId(resource.subject?.reference),
  };
}

export function fhirConditionToDetail(resource: FhirCondition): ConditionDetail {
  return {
    id: resource.id ?? '',
    kind: 'condition',
    name: conceptLabel(resource.code) ?? 'Condition',
    clinicalStatus: conceptLabel(resource.clinicalStatus),
    verificationStatus: conceptLabel(resource.verificationStatus),
    category: conceptLabel(resource.category?.[0]),
    severity: conceptLabel(resource.severity),
    onsetDate: resource.onsetDateTime,
    recordedDate: resource.recordedDate,
    notes: notesFrom(resource.note),
    patientId: referenceId(resource.subject?.reference),
  };
}

// --- AllergyIntolerance -----------------------------------------------------

export function fhirAllergyToEntry(resource: FhirAllergyIntolerance): HealthRecordEntry {
  return {
    id: resource.id ?? '',
    kind: 'allergy',
    name: conceptLabel(resource.code) ?? 'Allergy',
    clinicalStatus: conceptLabel(resource.clinicalStatus),
    tag: resource.criticality ? `${resource.criticality} risk` : undefined,
    recordedDate: resource.recordedDate ?? resource.onsetDateTime,
    patientId: referenceId(resource.patient?.reference),
  };
}

function mapReaction(
  reaction: NonNullable<FhirAllergyIntolerance['reaction']>[number]
): AllergyReactionDetail {
  return {
    manifestations: (reaction.manifestation ?? [])
      .map((manifestation) => conceptLabel(manifestation))
      .filter((label): label is string => Boolean(label)),
    severity: reaction.severity,
    description: reaction.description,
  };
}

export function fhirAllergyToDetail(resource: FhirAllergyIntolerance): AllergyDetail {
  return {
    id: resource.id ?? '',
    kind: 'allergy',
    name: conceptLabel(resource.code) ?? 'Allergy',
    type: resource.type,
    categories: resource.category ?? [],
    criticality: resource.criticality,
    clinicalStatus: conceptLabel(resource.clinicalStatus),
    verificationStatus: conceptLabel(resource.verificationStatus),
    onsetDate: resource.onsetDateTime,
    recordedDate: resource.recordedDate,
    reactions: (resource.reaction ?? []).map(mapReaction),
    notes: notesFrom(resource.note),
    patientId: referenceId(resource.patient?.reference),
  };
}

// --- Test results (Observation + DiagnosticReport) --------------------------

export function fhirObservationToLabResult(resource: FhirObservation): LabResult {
  const values: LabResultDetail['values'] = [];

  if (resource.component && resource.component.length > 0) {
    for (const component of resource.component) {
      const value = formatQuantity(component.valueQuantity) ?? component.valueString;

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
    notes: notesFrom(resource.note),
    patientId: referenceId(resource.subject?.reference),
  };
}

function buildLabValues(observation: FhirObservation): LabResultValueDetail[] {
  if (observation.component && observation.component.length > 0) {
    return observation.component
      .map((component): LabResultValueDetail | null => {
        const value = formatQuantity(component.valueQuantity) ?? component.valueString;

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

  const value = formatQuantity(observation.valueQuantity) ?? observation.valueString;
  return value === undefined ? [] : [{ value }];
}

function buildLabReport(report?: FhirDiagnosticReport): LabReportSummary | undefined {
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

export function fhirObservationToLabResultDetail(
  observation: FhirObservation,
  report?: FhirDiagnosticReport
): LabResultDetail {
  return {
    id: observation.id ?? '',
    name: conceptLabel(observation.code) ?? 'Result',
    status: observation.status ?? 'unknown',
    category: conceptLabel(observation.category?.[0]),
    effectiveDate: observation.effectiveDateTime ?? observation.issued,
    issued: observation.issued,
    performer: observation.performer?.[0]?.display,
    values: buildLabValues(observation),
    referenceRange: formatRange(observation.referenceRange?.[0]),
    interpretation: conceptLabel(observation.interpretation?.[0]),
    notes: notesFrom(observation.note),
    patientId: referenceId(observation.subject?.reference),
    report: buildLabReport(report),
  };
}

// --- Documents (DocumentReference) ------------------------------------------

function formatBytes(size?: number): string | undefined {
  if (size === undefined) {
    return undefined;
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function documentTitle(resource: FhirDocumentReference): string {
  return resource.content?.[0]?.attachment?.title ?? conceptLabel(resource.type) ?? 'Document';
}

export function fhirDocumentToRecord(resource: FhirDocumentReference): DocumentRecord {
  return {
    id: resource.id ?? '',
    title: documentTitle(resource),
    type: conceptLabel(resource.type),
    date: resource.date,
    patientId: referenceId(resource.subject?.reference),
  };
}

export function fhirDocumentToDetail(resource: FhirDocumentReference): DocumentDetail {
  const attachment = resource.content?.[0]?.attachment;

  return {
    ...fhirDocumentToRecord(resource),
    status: resource.status,
    docStatus: resource.docStatus,
    category: conceptLabel(resource.category?.[0]),
    author: resource.author?.[0]?.display,
    custodian: resource.custodian?.display,
    description: resource.description,
    contentType: attachment?.contentType,
    fileTitle: attachment?.title,
    fileSize: formatBytes(attachment?.size),
    fileUrl: attachment?.url,
  };
}
