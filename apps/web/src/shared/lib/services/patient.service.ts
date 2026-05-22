import type { PatientRepository } from '@/shared/lib/repositories';
import type { Patient } from '@/shared/types';

export class PatientService {
  constructor(private readonly repository: PatientRepository) {}

  list(): Promise<Patient[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<Patient | null> {
    return this.repository.findById(id);
  }
}
