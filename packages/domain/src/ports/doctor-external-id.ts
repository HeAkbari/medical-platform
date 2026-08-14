/**
 * Resolves a platform Doctor.id (independent of any EMR, see design doc §5)
 * back to the clinic-specific identifier an EMR call actually needs (e.g.
 * OSCAR's providerNo). A doctor works at exactly one clinic (confirmed), so
 * this is always a 1:1 lookup — no fan-out like PatientClinicIdentityStore.
 */
export interface DoctorExternalIdResolver {
  resolve(doctorId: string): Promise<{ clinicId: string; externalProviderId: string } | null>;
}
