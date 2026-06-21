import {
  referenceId,
  type FhirImmunization,
} from '@medical-platform/domain';
import { conceptLabel, formatQuantity } from './fhir-format';
import type { Vaccination, VaccinationDetail } from './clinical-record-types';

function doseNumber(immunization: FhirImmunization): number | undefined {
  return immunization.protocolApplied?.[0]?.doseNumberPositiveInt;
}

export function fhirImmunizationToVaccination(
  resource: FhirImmunization
): Vaccination {
  return {
    id: resource.id ?? '',
    name: conceptLabel(resource.vaccineCode) ?? 'Vaccine',
    status: resource.status ?? 'unknown',
    date: resource.occurrenceDateTime,
    doseNumber: doseNumber(resource),
    seriesDoses: resource.protocolApplied?.[0]?.seriesDosesPositiveInt,
    patientId: referenceId(resource.patient?.reference),
  };
}

export function fhirImmunizationToDetail(
  resource: FhirImmunization
): VaccinationDetail {
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
    notes:
      resource.note
        ?.map((note) => note.text)
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
