// Thin re-export — the real types moved to packages/domain/src/types/models.ts
// (see docs/oscar/new-approach/docs-oscar-new-approach.md §1) so every
// AppointmentRepository implementation can return AppointmentDetail from
// findDetailById(). Kept here so existing UI imports keep working unchanged.
export type {
  AppointmentDetail,
  AppointmentDoctorDetail,
  AppointmentLocationDetail,
} from '@medical-platform/domain';
