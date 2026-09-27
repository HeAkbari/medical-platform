import 'server-only';
import { prisma } from '@medical-platform/db';
import type { PatientRepository } from '../../ports/repositories';
import type { Patient } from '../../types/models';
import { normalizePhone } from '../../utils/helpers';
import type { CreatePatientInput, UpdatePatientInput } from '../../validation/schemas';

interface PatientRow {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  email: string | null;
  phone: string;
  healthNumber: string | null;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  createdAt: Date;
}

function toDomainPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toISOString().slice(0, 10) : null,
    email: row.email,
    phone: row.phone,
    healthNumber: row.healthNumber,
    addressLine: row.addressLine,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Basic patient identity is platform-owned data — per
 * docs/oscar/new-approach/patient-clinic-linking-architecture.md, this never
 * lives in or gets re-read from an EMR. Registration never contacts OSCAR;
 * clinic linking (name-based search, with create-if-not-found at booking
 * time) is a separate, later step — see EnsurePatientLinkedToClinicUseCase.
 */
export class PrismaPatientRepository implements PatientRepository {
  async findAll(): Promise<Patient[]> {
    const rows = await prisma.patient.findMany();
    return rows.map(toDomainPatient);
  }

  async findById(id: string): Promise<Patient | null> {
    const row = await prisma.patient.findUnique({ where: { id } });
    return row ? toDomainPatient(row) : null;
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    const target = normalizePhone(phone);
    const rows = await prisma.patient.findMany();
    const match = rows.find((row) => normalizePhone(row.phone) === target);
    return match ? toDomainPatient(match) : null;
  }

  async create(input: CreatePatientInput): Promise<Patient> {
    const row = await prisma.patient.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        email: input.email,
        phone: input.phone,
        healthNumber: input.healthNumber,
        addressLine: input.addressLine,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
      },
    });

    return toDomainPatient(row);
  }

  async update(id: string, input: UpdatePatientInput): Promise<Patient> {
    const row = await prisma.patient.update({
      where: { id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        email: input.email,
        healthNumber: input.healthNumber,
        addressLine: input.addressLine,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
      },
    });

    return toDomainPatient(row);
  }
}
