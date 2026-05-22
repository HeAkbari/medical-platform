import {
  AppointmentService,
  getMockRepositories,
} from '@medical-platform/domain';

const repositories = getMockRepositories();

export class AppointmentsService extends AppointmentService {
  constructor() {
    super(repositories.appointments);
  }
}

export const appointmentsService = new AppointmentsService();
