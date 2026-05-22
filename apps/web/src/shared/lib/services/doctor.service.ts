import type { DoctorRepository } from '@/shared/lib/repositories';
import type { Doctor } from '@/shared/types';

export class DoctorService {
  constructor(private readonly repository: DoctorRepository) {}

  list(): Promise<Doctor[]> {
    return this.repository.findAll();
  }

  getById(id: string): Promise<Doctor | null> {
    return this.repository.findById(id);
  }
}
