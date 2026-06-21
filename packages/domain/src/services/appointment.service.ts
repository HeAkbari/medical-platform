import type { AppointmentRepository } from '../ports/repositories';
import type { Appointment } from '../types/models';
import type {
  AppointmentQueryInput,
  CreateAppointmentInput,
} from '../validation/schemas';

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

  cancel(id: string): Promise<Appointment | null> {
    return this.repository.updateStatus(id, 'cancelled');
  }
}
