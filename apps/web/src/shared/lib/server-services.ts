import { getMockRepositories } from '@/shared/lib/mock-repositories';
import { AppointmentService } from '@/shared/lib/services/appointment.service';
import { DoctorService } from '@/shared/lib/services/doctor.service';
import { PatientService } from '@/shared/lib/services/patient.service';

const repositories = getMockRepositories();

export const patientService = new PatientService(repositories.patients);
export const doctorService = new DoctorService(repositories.doctors);
export const appointmentService = new AppointmentService(
  repositories.appointments
);
