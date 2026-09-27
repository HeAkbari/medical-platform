import type {
  ApiListResponse,
  Appointment,
  Doctor,
  Patient,
} from '@medical-platform/domain';
import type {
  AppointmentQueryInput,
  CreateAppointmentInput,
} from '@medical-platform/domain/validation';

export interface AvailableSlot {
  start: string;
  durationMinutes: number;
}

export class MedicalApiClient {
  constructor(private readonly baseUrl = '') {}

  private async parseJson<T>(response: Response): Promise<T> {
    const body = (await response.json().catch(() => null)) as
      | (T & { message?: string })
      | null;

    if (!response.ok) {
      throw new Error(body?.message ?? `Request failed with status ${response.status}`);
    }

    return body as T;
  }

  private buildUrl(path: string, query?: Record<string, string | undefined>) {
    const url = new URL(`${this.baseUrl}${path}`, 'http://localhost');

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value) {
          url.searchParams.set(key, value);
        }
      }
    }

    return `${url.pathname}${url.search}`;
  }

  async getPatients(): Promise<ApiListResponse<Patient>> {
    const response = await fetch(this.buildUrl('/api/v1/patients'));
    return this.parseJson<ApiListResponse<Patient>>(response);
  }

  async getPatient(id: string): Promise<{ data: Patient }> {
    const response = await fetch(this.buildUrl(`/api/v1/patients/${id}`));
    return this.parseJson<{ data: Patient }>(response);
  }

  async getDoctors(): Promise<ApiListResponse<Doctor>> {
    const response = await fetch(this.buildUrl('/api/v1/doctors'));
    return this.parseJson<ApiListResponse<Doctor>>(response);
  }

  async getDoctor(id: string): Promise<{ data: Doctor }> {
    const response = await fetch(this.buildUrl(`/api/v1/doctors/${id}`));
    return this.parseJson<{ data: Doctor }>(response);
  }

  /** `month` here is 0-indexed (JS `Date` convention, matches every caller's internal calendar state) — converted to the 1-indexed value the HTTP API expects right at this boundary, so a human reading the request URL sees `month=8` for August, not `month=7`. */
  async getDoctorWorkingDays(
    id: string,
    year: number,
    month: number,
    visitType: string
  ): Promise<{ data: { year: number; month: number; workingDays: number[] } }> {
    const response = await fetch(
      this.buildUrl(`/api/v1/doctors/${id}/availability`, {
        year: String(year),
        month: String(month + 1),
        visitType,
      })
    );
    return this.parseJson<{
      data: { year: number; month: number; workingDays: number[] };
    }>(response);
  }

  async getDoctorAvailableSlots(
    id: string,
    date: string,
    visitType: string
  ): Promise<{ data: { date: string; slots: AvailableSlot[] } }> {
    const response = await fetch(
      this.buildUrl(`/api/v1/doctors/${id}/availability`, { date, visitType })
    );
    return this.parseJson<{ data: { date: string; slots: AvailableSlot[] } }>(response);
  }

  async getAppointments(
    query?: AppointmentQueryInput
  ): Promise<ApiListResponse<Appointment>> {
    const response = await fetch(
      this.buildUrl('/api/v1/appointments', {
        patientId: query?.patientId,
        doctorId: query?.doctorId,
        date: query?.date,
      })
    );
    return this.parseJson<ApiListResponse<Appointment>>(response);
  }

  async createAppointment(
    input: CreateAppointmentInput
  ): Promise<{ data: Appointment }> {
    const response = await fetch(this.buildUrl('/api/v1/appointments'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return this.parseJson<{ data: Appointment }>(response);
  }
}

export const medicalApiClient = new MedicalApiClient();
