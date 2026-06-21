import {
  FhirClient,
  fhirToAppointment,
  type FhirAddress,
  type FhirAppointment,
  type FhirLocation,
  type FhirPractitioner,
} from '@medical-platform/domain';
import type { AppointmentDetail } from './appointment-detail';

function client(): FhirClient {
  return new FhirClient({
    baseUrl: process.env.FHIR_BASE_URL ?? 'http://localhost:8080/fhir',
    token: process.env.FHIR_TOKEN,
  });
}

function practitionerName(resource: FhirPractitioner): string {
  const name = resource.name?.[0];
  return (
    [name?.prefix?.join(' '), name?.given?.join(' '), name?.family]
      .filter(Boolean)
      .join(' ') || 'Practitioner'
  );
}

function formatAddress(address?: FhirAddress): string | undefined {
  if (!address) {
    return undefined;
  }
  return [address.line?.join(', '), address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(', ');
}

function contact(
  telecom: FhirPractitioner['telecom'],
  system: 'phone'
): string | undefined {
  return telecom?.find((entry) => entry.system === system)?.value;
}

/**
 * Loads one appointment with the Practitioner and Location resolved. Falls back
 * to the participant `display` names when those resources can't be fetched.
 */
export async function loadAppointmentDetail(
  id: string
): Promise<AppointmentDetail | null> {
  if (process.env.DATA_SOURCE !== 'fhir') {
    return null;
  }

  const fhir = client();
  const resource = await fhir.read<FhirAppointment>('Appointment', id);
  if (!resource) {
    return null;
  }

  const appointment = fhirToAppointment(resource);

  const [practitioner, location] = await Promise.all([
    appointment.doctorId
      ? fhir.read<FhirPractitioner>('Practitioner', appointment.doctorId)
      : Promise.resolve(null),
    appointment.locationId
      ? fhir.read<FhirLocation>('Location', appointment.locationId)
      : Promise.resolve(null),
  ]);

  return {
    id: appointment.id,
    status: appointment.status,
    fhirStatus: appointment.fhirStatus,
    scheduledAt: appointment.scheduledAt,
    endAt: resource.end,
    durationMinutes: appointment.durationMinutes,
    serviceCategory: appointment.serviceCategory,
    serviceType: appointment.serviceType,
    specialty: appointment.specialty,
    appointmentType: appointment.appointmentType,
    priority: appointment.priority,
    reason: appointment.reason,
    reasonText: appointment.reasonText,
    comment: appointment.notes ?? undefined,
    patientInstruction: resource.patientInstruction,
    created: appointment.createdAt,
    patientName: appointment.patientName,
    doctor: appointment.doctorId
      ? {
          id: appointment.doctorId,
          name: practitioner
            ? practitionerName(practitioner)
            : appointment.doctorName ?? 'Practitioner',
          specialty:
            practitioner?.qualification?.[0]?.code?.text ?? appointment.specialty,
          phone: practitioner ? contact(practitioner.telecom, 'phone') : undefined,
        }
      : undefined,
    location:
      appointment.locationId && (location || appointment.locationName)
        ? {
            id: appointment.locationId,
            name: location?.name ?? appointment.locationName ?? 'Location',
            address: formatAddress(location?.address),
            phone: location ? contact(location.telecom, 'phone') : undefined,
          }
        : undefined,
  };
}
