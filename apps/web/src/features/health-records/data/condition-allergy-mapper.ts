import {
  referenceId,
  type FhirAllergyIntolerance,
  type FhirCondition,
} from '@medical-platform/domain';
import { conceptLabel } from './fhir-format';
import type {
  AllergyDetail,
  AllergyReactionDetail,
  ConditionDetail,
  HealthRecordEntry,
} from './clinical-record-types';

function notes(note?: { text?: string }[]): string | undefined {
  return note?.map((entry) => entry.text).filter(Boolean).join(' ') || undefined;
}

// --- Condition ------------------------------------------------------------

export function fhirConditionToEntry(
  resource: FhirCondition
): HealthRecordEntry {
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

export function fhirConditionToDetail(
  resource: FhirCondition
): ConditionDetail {
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
    notes: notes(resource.note),
    patientId: referenceId(resource.subject?.reference),
  };
}

// --- AllergyIntolerance ---------------------------------------------------

export function fhirAllergyToEntry(
  resource: FhirAllergyIntolerance
): HealthRecordEntry {
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

export function fhirAllergyToDetail(
  resource: FhirAllergyIntolerance
): AllergyDetail {
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
    notes: notes(resource.note),
    patientId: referenceId(resource.patient?.reference),
  };
}
