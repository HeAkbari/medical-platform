import {
  AppointmentService,
  DoctorService,
  getMockRepositories,
  PatientService,
} from '@medical-platform/domain';

const repositories = getMockRepositories();

export const patientService = new PatientService(repositories.patients);
export const doctorService = new DoctorService(repositories.doctors);
export const appointmentService = new AppointmentService(
  repositories.appointments
);
