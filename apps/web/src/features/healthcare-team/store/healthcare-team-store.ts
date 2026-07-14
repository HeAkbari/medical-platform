import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_FAMILY_PHYSICIAN_ID,
  DEFAULT_TEAM_MEMBER_IDS,
} from '@/features/healthcare-team/data/mock-healthcare-team';

interface HealthcareTeamStore {
  /** Assigned by clinic/system — patients can view only, not select. */
  familyPhysicianId: string | null;
  /** Patient-managed care team (multiple physicians allowed). */
  teamMemberIds: string[];
  addTeamMember: (id: string) => void;
  removeTeamMember: (id: string) => void;
}

export const useHealthcareTeamStore = create<HealthcareTeamStore>()(
  persist(
    (set, get) => ({
      familyPhysicianId: DEFAULT_FAMILY_PHYSICIAN_ID,
      teamMemberIds: DEFAULT_TEAM_MEMBER_IDS,
      addTeamMember: (id) => {
        const { familyPhysicianId, teamMemberIds } = get();
        if (id === familyPhysicianId || teamMemberIds.includes(id)) {
          return;
        }
        set({ teamMemberIds: [...teamMemberIds, id] });
      },
      removeTeamMember: (id) => {
        set({
          teamMemberIds: get().teamMemberIds.filter((memberId) => memberId !== id),
        });
      },
    }),
    {
      name: 'medical-platform:healthcare-team',
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<HealthcareTeamStore>;
        return {
          ...current,
          ...stored,
          teamMemberIds: stored.teamMemberIds ?? current.teamMemberIds,
          familyPhysicianId:
            stored.familyPhysicianId !== undefined
              ? stored.familyPhysicianId
              : current.familyPhysicianId,
        };
      },
    }
  )
);
