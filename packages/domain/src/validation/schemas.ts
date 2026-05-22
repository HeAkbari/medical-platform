import { z } from 'zod';

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'completed',
  'cancelled',
]);

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240),
  reason: z.string().min(3).max(500),
  notes: z.string().max(1000).nullable().optional(),
});

export const appointmentQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;
