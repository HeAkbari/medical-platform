import type {
  FhirCodeableConcept,
  FhirContactPoint,
  FhirHealthcareService,
  FhirLocation,
  FhirOrganization,
  FhirPractitioner,
  FhirPractitionerRole,
  FhirReference,
} from '@medical-platform/domain';
import {
  buildWeeklyHours,
  CATEGORY_TO_SUPER,
  computeIsOpenNow,
  resolveCategory,
} from './fhir-facility-mapper';
import type {
  FacilityDetail,
  FacilityOrganizationDetail,
  FacilityPractitionerDetail,
  FacilityServiceDetail,
} from './facility-detail';

function ccText(concept?: FhirCodeableConcept): string | undefined {
  return (
    concept?.text ??
    concept?.coding?.[0]?.display ??
    concept?.coding?.[0]?.code ??
    undefined
  );
}

function ccList(concepts?: FhirCodeableConcept[]): string[] {
  return (concepts ?? [])
    .map(ccText)
    .filter((value): value is string => Boolean(value));
}

function refId(reference?: FhirReference): string {
  return reference?.reference?.split('/').pop() ?? '';
}

function contactValue(
  telecom: FhirContactPoint[] | undefined,
  system: 'phone' | 'url' | 'email'
): string | undefined {
  return telecom?.find((entry) => entry.system === system)?.value;
}

function mapService(hs: FhirHealthcareService): FacilityServiceDetail {
  return {
    id: hs.id ?? '',
    name: hs.name,
    categories: ccList(hs.category),
    types: ccList(hs.type),
    specialties: ccList(hs.specialty),
    comment: hs.comment,
    extraDetails: hs.extraDetails,
    appointmentRequired: hs.appointmentRequired,
    referralMethods: ccList(hs.referralMethod),
    eligibility: (hs.eligibility ?? [])
      .map((item) => item.comment ?? ccText(item.code))
      .filter((value): value is string => Boolean(value)),
    programs: ccList(hs.program),
    languages: ccList(hs.communication),
    availableTimes: (hs.availableTime ?? []).map((time) => ({
      days: time.daysOfWeek ?? [],
      allDay: time.allDay,
      start: time.availableStartTime,
      end: time.availableEndTime,
    })),
  };
}

function practitionerName(practitioner?: FhirPractitioner): string {
  const name = practitioner?.name?.[0];
  if (!name) {
    return 'Unknown practitioner';
  }

  const prefix = name.prefix?.[0] ? `${name.prefix[0]} ` : '';
  return `${prefix}${name.given?.[0] ?? ''} ${name.family ?? ''}`.trim();
}

function mapPractitionerRole(
  role: FhirPractitionerRole,
  practitionersById: Map<string, FhirPractitioner>
): FacilityPractitionerDetail {
  const practitioner = practitionersById.get(refId(role.practitioner));
  const specialties = ccList(role.specialty);

  return {
    id: role.id ?? '',
    name: practitionerName(practitioner),
    role: ccText(role.code?.[0]),
    specialties:
      specialties.length > 0
        ? specialties
        : ccList(practitioner?.qualification?.map((q) => q.code ?? {})),
  };
}

function mapOrganization(
  organization?: FhirOrganization
): FacilityOrganizationDetail | undefined {
  if (!organization) {
    return undefined;
  }

  return {
    id: organization.id ?? '',
    name: organization.name,
    type: ccText(organization.type?.[0]),
    phone: contactValue(organization.telecom, 'phone'),
    website: contactValue(organization.telecom, 'url'),
  };
}

export interface FacilityDetailInputs {
  location: FhirLocation;
  services: FhirHealthcareService[];
  roles: FhirPractitionerRole[];
  practitioners: FhirPractitioner[];
  organizations: FhirOrganization[];
}

export function buildFacilityDetail({
  location,
  services,
  roles,
  practitioners,
  organizations,
}: FacilityDetailInputs): FacilityDetail {
  const category = resolveCategory(location);
  const superCategory = CATEGORY_TO_SUPER[category];
  const hours = buildWeeklyHours(location.hoursOfOperation);

  const practitionersById = new Map(
    practitioners.map((practitioner) => [practitioner.id ?? '', practitioner])
  );
  const organizationsById = new Map(
    organizations.map((organization) => [organization.id ?? '', organization])
  );

  // Resolve the organization from a service or a practitioner role.
  const orgRef =
    services.find((service) => service.providedBy)?.providedBy ??
    roles.find((role) => role.organization)?.organization;
  const organization = mapOrganization(organizationsById.get(refId(orgRef)));

  return {
    id: location.id ?? '',
    name: location.name ?? 'Unnamed facility',
    description: location.status === 'active' ? undefined : location.status,
    status: location.status,
    category,
    superCategory,
    subcategory: location.type?.find((concept) => concept.text)?.text,
    address: {
      street: location.address?.line?.[0] ?? '',
      city: location.address?.city ?? '',
      province: 'BC',
      postalCode: location.address?.postalCode ?? '',
    },
    position: [
      location.position?.latitude ?? 0,
      location.position?.longitude ?? 0,
    ],
    phone: contactValue(location.telecom, 'phone'),
    email: contactValue(location.telecom, 'email'),
    website: contactValue(location.telecom, 'url'),
    hours,
    isOpenNow: computeIsOpenNow(hours),
    organization,
    services: services.map(mapService),
    practitioners: roles.map((role) =>
      mapPractitionerRole(role, practitionersById)
    ),
    source: 'fhir',
  };
}
