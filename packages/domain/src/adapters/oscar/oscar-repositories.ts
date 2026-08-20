import type { DoctorExternalIdResolver } from '../../ports/doctor-external-id';
import type { PatientClinicIdentityStore } from '../../ports/patient-clinic-identity';
import type {
  AppointmentRepository,
  DocumentRepository,
  DoctorRepository,
  HealthConditionRepository,
  ImmunizationRepository,
  PrescriptionRepository,
  TestResultRepository,
} from '../../ports/repositories';
import type {
  Appointment,
  AppointmentDetail,
  AppointmentStatus,
  Doctor,
} from '../../types/models';
import type {
  DocumentDetail,
  DocumentRecord,
  HealthRecordDetail,
  HealthRecordEntry,
  HealthRecordKind,
  LabResult,
  LabResultDetail,
  Prescription,
  PrescriptionDetail,
  Vaccination,
  VaccinationDetail,
} from '../../types/health-records';
import type { CreateAppointmentInput } from '../../validation/schemas';
import { OscarClient } from './oscar-client';
import {
  oscarAllergyToEntry,
  oscarAppointmentHistoryToDomain,
  oscarDayApptToDomain,
  oscarDiseaseRegistryItemToEntry,
  oscarDrugToPrescription,
  oscarHl7LabMessageToLabResult,
  oscarPreventionToVaccination,
  oscarProviderApptToDomain,
  oscarToDoctor,
} from './oscar-mappers';
import type {
  OscarAllergyResponse,
  OscarAppointmentTo1,
  OscarDayApptItem,
  OscarDiseaseRegistryItem,
  OscarDrug,
  OscarHl7LabsResponse,
  OscarPaginated,
  OscarPreventionResponse,
  OscarProvider,
  OscarProviderPeriodAppsTo,
  OscarSchedulingResponse,
} from './oscar-types';

// OSCAR's own pseudo-provider account for internal/system use — never a real
// bookable physician. Verified live in the sponsor sandbox's provider list
// (providerType: "system"). Filtered out here, not at the mapper level,
// since it's a directory-sync concern, not a shape-mapping one.
const SYSTEM_PROVIDER_NO = '-1';

export class OscarDoctorRepository implements DoctorRepository {
  constructor(private readonly client: OscarClient) {}

  async findAll(): Promise<Doctor[]> {
    // Verified live: providers_json (unlike the WADL-default `providers`,
    // which only ever produces XML).
    const result = (await this.client.get(
      '/providerService/providers_json'
    )) as OscarPaginated<OscarProvider>;

    return result.content
      .filter(
        (provider) =>
          provider.enabled !== false && String(provider.providerNo) !== SYSTEM_PROVIDER_NO
      )
      .map((provider) => oscarToDoctor(provider));
  }

  async findById(id: string): Promise<Doctor | null> {
    // Verified live: an unknown providerNo returns 200 with an empty body
    // (-> null), not a 404 — OscarHttpError is only for genuine failures.
    const provider = (await this.client.get(
      `/providerService/provider/${encodeURIComponent(id)}`
    )) as OscarProvider | null;

    return provider ? oscarToDoctor(provider) : null;
  }
}

function splitIsoDateTime(iso: string): { date: string; time: string } {
  const parsed = new Date(iso);
  const date = parsed.toISOString().slice(0, 10);
  const time = parsed.toISOString().slice(11, 16);
  return { date, time };
}

function toOscarStatusCode(status: AppointmentStatus): string {
  if (status === 'cancelled') {
    return 'c';
  }

  if (status === 'scheduled') {
    return 't';
  }

  // OSCAR's status vocabulary beyond 'cancelled'/'scheduled' isn't verified
  // live yet (see design doc risk list) — the current UI only ever cancels.
  throw new Error(`Unsupported appointment status for OSCAR: ${status}`);
}

export class OscarAppointmentRepository implements AppointmentRepository {
  constructor(
    private readonly client: OscarClient,
    private readonly clinicId: string,
    private readonly identities: PatientClinicIdentityStore,
    private readonly doctors: DoctorExternalIdResolver
  ) {}

  /**
   * `doctorId` arriving here is always the platform Doctor.id (from
   * /api/v1/doctors) — resolve it to the clinic's real providerNo before
   * calling OSCAR. Returns null if this doctor isn't in our directory yet
   * (e.g. sync hasn't run) rather than guessing.
   */
  private async resolveProviderNo(doctorId: string): Promise<string | null> {
    const resolved = await this.doctors.resolve(doctorId);
    return resolved ? resolved.externalProviderId : null;
  }

  async findAll(filters?: {
    patientId?: string;
    doctorId?: string;
    date?: string;
  }): Promise<Appointment[]> {
    if (filters?.patientId) {
      const identity = await this.identities.find(filters.patientId, this.clinicId);

      if (!identity) {
        // Not linked to this clinic yet -> no appointments here, not an error.
        return [];
      }

      const response = (await this.client.post(
        `/schedule/${encodeURIComponent(identity.externalPatientId)}/appointmentHistory`
      )) as OscarSchedulingResponse;

      return (response.appointments ?? []).map((item) =>
        oscarAppointmentHistoryToDomain(item, filters.patientId as string)
      );
    }

    if (filters?.doctorId) {
      const providerNo = await this.resolveProviderNo(filters.doctorId);

      if (!providerNo) {
        // Not in our synced directory yet -> no known schedule, not an error.
        return [];
      }

      if (filters.date) {
        const items = (await this.client.get(
          `/schedule/${encodeURIComponent(providerNo)}/day/${encodeURIComponent(filters.date)}`
        )) as OscarDayApptItem[];

        return items.map((item) => oscarDayApptToDomain(item, filters.date as string));
      }

      const today = new Date().toISOString().slice(0, 10);
      const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const response = (await this.client.get(
        `/schedule/fetchProviderAppts/${encodeURIComponent(providerNo)}/${today}/${in90Days}`
      )) as OscarPaginated<OscarProviderPeriodAppsTo>;

      return response.content.map(oscarProviderApptToDomain);
    }

    throw new Error(
      'OscarAppointmentRepository.findAll requires patientId or doctorId — OSCAR has no "list everything" endpoint.'
    );
  }

  async findById(_id: string): Promise<Appointment | null> {
    // GET /schedule/getAppointment's exact params/shape aren't verified live
    // yet — real data first (see docs/oscar/new-approach), not a guess.
    throw new Error('OscarAppointmentRepository.findById is not implemented yet.');
  }

  /**
   * Built on top of findById so this starts working automatically once
   * /schedule/getAppointment is verified — no separate fetch logic to keep
   * in sync. `location` is intentionally omitted: OSCAR has no Location
   * concept, and ClinicCredential isn't linked to a Facility yet (see
   * design doc §5/§6 gap).
   */
  async findDetailById(id: string): Promise<AppointmentDetail | null> {
    const appointment = await this.findById(id);

    if (!appointment) {
      return null;
    }

    const doctor = await new OscarDoctorRepository(this.client).findById(appointment.doctorId);

    return {
      id: appointment.id,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      reason: appointment.reason,
      comment: appointment.notes ?? undefined,
      created: appointment.createdAt,
      patientName: appointment.patientName,
      doctor: doctor
        ? {
            id: doctor.id,
            name: `${doctor.firstName} ${doctor.lastName}`.trim(),
            specialty: doctor.specialty,
            phone: doctor.phone || undefined,
          }
        : undefined,
    };
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const identity = await this.identities.find(input.patientId, this.clinicId);

    if (!identity) {
      throw new Error('Patient is not linked to this clinic — call linkToClinic first.');
    }

    const providerNo = await this.resolveProviderNo(input.doctorId);

    if (!providerNo) {
      throw new Error(`Doctor ${input.doctorId} not found in this clinic's directory.`);
    }

    const { date, time } = splitIsoDateTime(input.scheduledAt);

    // Body shape provided by the clinic owner from a working Postman request;
    // not yet exercised live from this codebase.
    const created = (await this.client.post('/schedule/add', {
      providerNo,
      appointmentDate: date,
      startTime: time,
      demographicNo: Number(identity.externalPatientId),
      notes: input.notes ?? '',
      reason: input.reason,
      location: '',
      resources: '',
      type: '',
      status: 't',
      duration: input.durationMinutes,
      urgency: '',
      reasonCode: 17,
    })) as OscarAppointmentTo1 | { appointmentNo?: number; id?: number } | null;

    const id = created && 'id' in created && created.id != null
      ? created.id
      : created && 'appointmentNo' in created
        ? created.appointmentNo
        : undefined;

    return {
      id: id != null ? String(id) : '',
      patientId: input.patientId,
      doctorId: input.doctorId,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      status: 'scheduled',
      reason: input.reason,
      notes: input.notes ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment | null> {
    const code = toOscarStatusCode(status);

    // Path + body shape follow the design doc's endpoint table; not yet
    // exercised live from this codebase.
    await this.client.post(`/schedule/appointment/${encodeURIComponent(id)}/updateStatus`, {
      status: code,
    });

    // Can't re-fetch the full record yet (findById isn't implemented, see
    // above) — a caller-facing `null` here would read as "not found" even
    // though the OSCAR call succeeded (see apps/web's cancel route), so
    // return a partial stub instead of a false negative. Callers that need
    // the full record should re-fetch their own cached copy for now.
    return {
      id,
      patientId: '',
      doctorId: '',
      scheduledAt: '',
      durationMinutes: 0,
      status,
      reason: '',
      notes: null,
      createdAt: '',
    };
  }
}

/**
 * Every OSCAR clinical-data endpoint used here (allergies, rx, preventions)
 * is scoped by demographicNo — there's no patient-independent single-record
 * lookup by id, the same systemic limitation as
 * OscarAppointmentRepository.findById. `findById` on these three
 * repositories throws rather than guessing; fixing this for real would mean
 * threading patientId into the detail API routes, which is a bigger,
 * separate change than this step.
 */
export class OscarPrescriptionRepository implements PrescriptionRepository {
  constructor(
    private readonly client: OscarClient,
    private readonly clinicId: string,
    private readonly identities: PatientClinicIdentityStore
  ) {}

  async findAll(patientId?: string): Promise<Prescription[]> {
    if (!patientId) {
      throw new Error(
        'OscarPrescriptionRepository.findAll requires a patientId — OSCAR has no "list everything" endpoint.'
      );
    }

    const identity = await this.identities.find(patientId, this.clinicId);

    if (!identity) {
      return [];
    }

    const [current, archived] = await Promise.all([
      this.client.get(
        `/rx/drugs/current/${encodeURIComponent(identity.externalPatientId)}`
      ) as Promise<OscarPaginated<OscarDrug>>,
      this.client.get(
        `/rx/drugs/archived/${encodeURIComponent(identity.externalPatientId)}`
      ) as Promise<OscarPaginated<OscarDrug>>,
    ]);

    return [...current.content, ...archived.content]
      .map((drug) => oscarDrugToPrescription(drug, patientId))
      .sort((a, b) => (b.authoredOn ?? '').localeCompare(a.authoredOn ?? ''));
  }

  async findById(_id: string): Promise<PrescriptionDetail | null> {
    throw new Error(
      'OscarPrescriptionRepository.findById is not implemented — OSCAR has no patient-independent single-prescription lookup.'
    );
  }
}

export class OscarImmunizationRepository implements ImmunizationRepository {
  constructor(
    private readonly client: OscarClient,
    private readonly clinicId: string,
    private readonly identities: PatientClinicIdentityStore
  ) {}

  async findAll(patientId?: string): Promise<Vaccination[]> {
    if (!patientId) {
      throw new Error(
        'OscarImmunizationRepository.findAll requires a patientId — OSCAR has no "list everything" endpoint.'
      );
    }

    const identity = await this.identities.find(patientId, this.clinicId);

    if (!identity) {
      return [];
    }

    const response = (await this.client.get(
      `/preventions/immunizations/${encodeURIComponent(identity.externalPatientId)}`
    )) as OscarPreventionResponse;

    return (response.preventions ?? [])
      .map((prevention) => oscarPreventionToVaccination(prevention, patientId))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }

  async findById(_id: string): Promise<VaccinationDetail | null> {
    throw new Error(
      'OscarImmunizationRepository.findById is not implemented — OSCAR has no patient-independent single-immunization lookup.'
    );
  }
}

/**
 * 'allergy' uses the clean `/allergies/active` mapping; 'condition' uses
 * `/dxRegisty/getDiseaseRegistry`, confirmed live but with an UNVERIFIED
 * populated item shape (see design doc §10 / deferred-items.md §6) — kept
 * defensive on purpose. findById on either kind throws: same systemic
 * "no patient-independent single-record lookup" limitation as
 * prescriptions/immunizations, not a silent empty/wrong result.
 */
export class OscarHealthConditionRepository implements HealthConditionRepository {
  constructor(
    private readonly client: OscarClient,
    private readonly clinicId: string,
    private readonly identities: PatientClinicIdentityStore
  ) {}

  async findAll(patientId?: string): Promise<HealthRecordEntry[]> {
    if (!patientId) {
      throw new Error(
        'OscarHealthConditionRepository.findAll requires a patientId — OSCAR has no "list everything" endpoint.'
      );
    }

    const identity = await this.identities.find(patientId, this.clinicId);

    if (!identity) {
      return [];
    }

    const [allergyResponse, conditions] = await Promise.all([
      this.client.get('/allergies/active', {
        query: { demographicNo: identity.externalPatientId },
      }) as Promise<OscarAllergyResponse>,
      this.client.get('/dxRegisty/getDiseaseRegistry', {
        query: { demographicNo: identity.externalPatientId },
      }) as Promise<OscarDiseaseRegistryItem[]>,
    ]);

    const allergyEntries = (allergyResponse.allergies ?? []).map((allergy) =>
      oscarAllergyToEntry(allergy, patientId)
    );
    const conditionEntries = (conditions ?? []).map((item) =>
      oscarDiseaseRegistryItemToEntry(item, patientId)
    );

    return [...conditionEntries, ...allergyEntries].sort((a, b) =>
      (b.recordedDate ?? '').localeCompare(a.recordedDate ?? '')
    );
  }

  async findById(_id: string, kind: HealthRecordKind): Promise<HealthRecordDetail | null> {
    throw new Error(
      `OscarHealthConditionRepository.findById is not implemented for ${kind} — OSCAR has no patient-independent single-record lookup.`
    );
  }
}

export class OscarTestResultRepository implements TestResultRepository {
  constructor(
    private readonly client: OscarClient,
    private readonly clinicId: string,
    private readonly identities: PatientClinicIdentityStore
  ) {}

  async findAll(patientId?: string): Promise<LabResult[]> {
    if (!patientId) {
      throw new Error(
        'OscarTestResultRepository.findAll requires a patientId — OSCAR has no "list everything" endpoint.'
      );
    }

    const identity = await this.identities.find(patientId, this.clinicId);

    if (!identity) {
      return [];
    }

    const response = (await this.client.get('/labs/hl7LabsByDemographicNo', {
      query: { demographicNo: identity.externalPatientId, offset: '0', limit: '100' },
    })) as OscarHl7LabsResponse;

    return (response.messages ?? [])
      .map((message) => oscarHl7LabMessageToLabResult(message, patientId))
      .sort((a, b) => (b.effectiveDate ?? '').localeCompare(a.effectiveDate ?? ''));
  }

  async findById(_id: string): Promise<LabResultDetail | null> {
    throw new Error(
      'OscarTestResultRepository.findById is not implemented — OSCAR has no patient-independent single-result lookup.'
    );
  }
}

/**
 * No verified clean OSCAR REST resource exists for listing documents (the
 * `/demographics/basic/{id}?includes[]=documents` lead proved unreliable —
 * see design doc §10 / deferred-items.md §5) — both methods throw an
 * explicit error rather than a silent empty list indistinguishable from
 * "this patient has no documents".
 */
export class OscarDocumentRepository implements DocumentRepository {
  async findAll(_patientId?: string): Promise<DocumentRecord[]> {
    throw new Error(
      'Documents are not available for OSCAR-linked clinics — no verified clean REST resource (see design doc §10).'
    );
  }

  async findById(_id: string): Promise<DocumentDetail | null> {
    throw new Error(
      'Documents are not available for OSCAR-linked clinics — no verified clean REST resource (see design doc §10).'
    );
  }
}
