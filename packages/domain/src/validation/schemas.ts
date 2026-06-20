import { z } from 'zod';

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'completed',
  'cancelled',
]);

// Resource ids are backend-defined: UUIDs from the mock store, numeric ids from
// a FHIR server (HAPI / OSCAR). Accept any non-empty id rather than forcing UUID.
const resourceId = z.string().min(1);

export const createAppointmentSchema = z.object({
  patientId: resourceId,
  doctorId: resourceId,
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240),
  reason: z.string().min(3).max(500),
  notes: z.string().max(1000).nullable().optional(),
});

export const appointmentQuerySchema = z.object({
  patientId: resourceId.optional(),
  doctorId: resourceId.optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;

export const createPatientSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must use YYYY-MM-DD format'),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

export const sendOtpSchema = z.object({
  phone: z.string().min(8).max(20),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().length(6),
});

export const completeRegistrationSchema = createPatientSchema.extend({
  registrationToken: z.string().uuid(),
});
