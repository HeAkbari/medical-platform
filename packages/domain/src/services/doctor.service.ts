import type { DoctorRepository } from '../ports/repositories';
import type { Doctor } from '../types/models';

export class DoctorService {
  constructor(private readonly repository: DoctorRepository) {}

  list(): Promise<Doctor[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<Doctor | null> {
    return this.repository.findById(id);
  }
}
