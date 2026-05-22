import type {
  ApiListResponse,
  Appointment,
  Doctor,
  Patient,
} from '@/shared/types';
import type {
  AppointmentQueryInput,
  CreateAppointmentInput,
} from '@/shared/lib/validators/schemas';

export class MedicalApiClient {
  constructor(private readonly baseUrl = '') {}

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
    return response.json() as Promise<ApiListResponse<Patient>>;
  }

  async getPatient(id: string): Promise<{ data: Patient }> {
    const response = await fetch(this.buildUrl(`/api/v1/patients/${id}`));
    return response.json() as Promise<{ data: Patient }>;
  }

  async getDoctors(): Promise<ApiListResponse<Doctor>> {
    const response = await fetch(this.buildUrl('/api/v1/doctors'));
    return response.json() as Promise<ApiListResponse<Doctor>>;
  }

  async getDoctor(id: string): Promise<{ data: Doctor }> {
    const response = await fetch(this.buildUrl(`/api/v1/doctors/${id}`));
    return response.json() as Promise<{ data: Doctor }>;
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
    return response.json() as Promise<ApiListResponse<Appointment>>;
  }

  async createAppointment(
    input: CreateAppointmentInput
  ): Promise<{ data: Appointment }> {
    const response = await fetch(this.buildUrl('/api/v1/appointments'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return response.json() as Promise<{ data: Appointment }>;
  }
}

export const medicalApiClient = new MedicalApiClient();
