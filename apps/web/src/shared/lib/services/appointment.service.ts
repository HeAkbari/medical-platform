import type { AppointmentRepository } from '@/shared/lib/repositories';
import type { Appointment } from '@/shared/types';
import type {
  AppointmentQueryInput,
  CreateAppointmentInput,
} from '@/shared/lib/validators/schemas';

export class AppointmentService {
  constructor(private readonly repository: AppointmentRepository) {}

  list(filters?: AppointmentQueryInput): Promise<Appointment[]> {
    return this.repository.findAll(filters);
  }

  getById(id: string): Promise<Appointment | null> {
    return this.repository.findById(id);
  }

  create(input: CreateAppointmentInput): Promise<Appointment> {
    return this.repository.create(input);
  }
}
