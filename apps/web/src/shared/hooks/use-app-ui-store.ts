import { create } from 'zustand';

interface AppUiState {
  sidebarOpen: boolean;
  selectedPatientId: string | null;
  setSidebarOpen: (open: boolean) => void;
  setSelectedPatientId: (patientId: string | null) => void;
}

export const useAppUiStore = create<AppUiState>((set) => ({
  sidebarOpen: true,
  selectedPatientId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedPatientId: (patientId) => set({ selectedPatientId: patientId }),
}));
