import { AppointmentService, PatientService } from '@medical-platform/domain';
import { repositories } from './repositories';

export const patientService = new PatientService(repositories.patients);
export const appointmentService = new AppointmentService(
  repositories.appointments
);
