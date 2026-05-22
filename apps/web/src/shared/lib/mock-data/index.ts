import type {
  Appointment,
  Doctor,
  Patient,
} from '@/shared/types';
import appointmentsJson from './assets/appointments.json';
import doctorsJson from './assets/doctors.json';
import patientsJson from './assets/patients.json';

export const patients = patientsJson as Patient[];
export const doctors = doctorsJson as Doctor[];
export const appointments = appointmentsJson as Appointment[];

export type MockDataStore = {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
};

export function createMockDataStore(): MockDataStore {
  return {
    patients: structuredClone(patients),
    doctors: structuredClone(doctors),
    appointments: structuredClone(appointments),
  };
}
