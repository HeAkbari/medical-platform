import type { PatientRepository } from '../ports/repositories';
import type { Patient } from '../types/models';
import type { CreatePatientInput } from '../validation/schemas';

export class PatientService {
  constructor(private readonly repository: PatientRepository) {}

  list(): Promise<Patient[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<Patient | null> {
    return this.repository.findById(id);
  }

  findByPhone(phone: string): Promise<Patient | null> {
    return this.repository.findByPhone(phone);
  }

  create(input: CreatePatientInput): Promise<Patient> {
    return this.repository.create(input);
  }
}
