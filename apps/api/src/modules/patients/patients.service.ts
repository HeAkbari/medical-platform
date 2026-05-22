import {
  AppointmentService,
  getMockRepositories,
  PatientService,
} from '@medical-platform/domain';

const repositories = getMockRepositories();

export class PatientsService extends PatientService {
  constructor() {
    super(repositories.patients);
  }
}

export class AppointmentsMockService extends AppointmentService {
  constructor() {
    super(repositories.appointments);
  }
}

export const patientsService = new PatientsService();
export const appointmentsMockService = new AppointmentsMockService();
