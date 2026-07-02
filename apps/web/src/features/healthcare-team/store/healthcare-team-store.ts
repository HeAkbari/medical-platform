import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FAMILY_PHYSICIAN_ID } from '@/features/healthcare-team/data/mock-healthcare-team';

interface HealthcareTeamStore {
  familyPhysicianId: string | null;
  setFamilyPhysicianId: (id: string | null) => void;
}

export const useHealthcareTeamStore = create<HealthcareTeamStore>()(
  persist(
    (set) => ({
      familyPhysicianId: DEFAULT_FAMILY_PHYSICIAN_ID,
      setFamilyPhysicianId: (id) => set({ familyPhysicianId: id }),
    }),
    { name: 'medical-platform:healthcare-team' }
  )
);
