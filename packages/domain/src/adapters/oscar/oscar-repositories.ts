import type { PatientClinicIdentityStore } from '../../ports/patient-clinic-identity';
import type { AppointmentRepository, DoctorRepository } from '../../ports/repositories';
import type { Appointment, AppointmentStatus, Doctor } from '../../types/models';
import type { CreateAppointmentInput } from '../../validation/schemas';
import { OscarClient } from './oscar-client';
import {
  oscarAppointmentHistoryToDomain,
  oscarDayApptToDomain,
  oscarProviderApptToDomain,
  oscarToDoctor,
} from './oscar-mappers';
import type {
  OscarAppointmentTo1,
  OscarDayApptItem,
  OscarPaginated,
  OscarProvider,
  OscarProviderPeriodAppsTo,
  OscarSchedulingResponse,
  OscarXmlList,
} from './oscar-types';

export class OscarDoctorRepository implements DoctorRepository {
  constructor(private readonly client: OscarClient) {}

  async findAll(): Promise<Doctor[]> {
    // Verified live: this endpoint only produces XML (406 on Accept: json).
    const result = (await this.client.get('/providerService/providers', {
      format: 'xml',
    })) as OscarXmlList<OscarProvider>;

    return result.List.Item.map((provider) => oscarToDoctor(provider));
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
    private readonly identities: PatientClinicIdentityStore
  ) {}

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

    if (filters?.doctorId && filters.date) {
      const items = (await this.client.get(
        `/schedule/${encodeURIComponent(filters.doctorId)}/day/${encodeURIComponent(filters.date)}`
      )) as OscarDayApptItem[];

      return items.map((item) => oscarDayApptToDomain(item, filters.date as string));
    }

    if (filters?.doctorId) {
      const today = new Date().toISOString().slice(0, 10);
      const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const response = (await this.client.get(
        `/schedule/fetchProviderAppts/${encodeURIComponent(filters.doctorId)}/${today}/${in90Days}`
      )) as OscarPaginated<OscarProviderPeriodAppsTo>;

      return response.content.map(oscarProviderApptToDomain);
    }

    throw new Error(
      'OscarAppointmentRepository.findAll requires patientId or doctorId — OSCAR has no "list everything" endpoint.'
    );
  }

  async findById(): Promise<Appointment | null> {
    // GET /schedule/getAppointment's exact params/shape aren't verified live
    // yet — real data first (see docs/oscar/new-approach), not a guess.
    throw new Error('OscarAppointmentRepository.findById is not implemented yet.');
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const identity = await this.identities.find(input.patientId, this.clinicId);

    if (!identity) {
      throw new Error('Patient is not linked to this clinic — call linkToClinic first.');
    }

    const { date, time } = splitIsoDateTime(input.scheduledAt);

    // Body shape provided by the clinic owner from a working Postman request;
    // not yet exercised live from this codebase.
    const created = (await this.client.post('/schedule/add', {
      providerNo: input.doctorId,
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
