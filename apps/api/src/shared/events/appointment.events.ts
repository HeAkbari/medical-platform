export const APPOINTMENT_CREATED_EVENT = 'appointment.created';
export const APPOINTMENT_CANCELLED_EVENT = 'appointment.cancelled';

export interface AppointmentCreatedPayload {
  appointmentId: string;
  patientId: string;
  doctorId: string;
}
