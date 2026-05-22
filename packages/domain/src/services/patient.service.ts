import type { PatientRepository } from '../ports/repositories';
import type { Patient } from '../types/models';

export class PatientService {
  constructor(private readonly repository: PatientRepository) {}

  list(): Promise<Patient[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<Patient | null> {
    return this.repository.findById(id);
  }
}
