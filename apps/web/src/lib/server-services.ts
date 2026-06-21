import {
  AppointmentService,
  DoctorService,
  PatientService,
} from '@medical-platform/domain';
import { repositories } from './repositories';

export const patientService = new PatientService(repositories.patients);
export const doctorService = new DoctorService(repositories.doctors);
export const appointmentService = new AppointmentService(
  repositories.appointments
);
