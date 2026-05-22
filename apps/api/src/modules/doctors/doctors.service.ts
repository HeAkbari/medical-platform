import { DoctorService, getMockRepositories } from '@medical-platform/domain';

const repositories = getMockRepositories();

export class DoctorsService extends DoctorService {
  constructor() {
    super(repositories.doctors);
  }
}

export const doctorsService = new DoctorsService();
