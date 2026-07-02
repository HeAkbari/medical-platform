import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
}

export interface PrivacyPreferences {
  thirdPartySharing: boolean;
  behavioralLogging: boolean;
}

interface SettingsStore {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  biometricsEnabled: boolean;
  setNotificationPref: (
    key: keyof NotificationPreferences,
    value: boolean
  ) => void;
  setPrivacyPref: (key: keyof PrivacyPreferences, value: boolean) => void;
  setBiometricsEnabled: (value: boolean) => void;
}

const defaultState = {
  notifications: {
    push: true,
    sms: true,
    email: false,
  },
  privacy: {
    thirdPartySharing: false,
    behavioralLogging: true,
  },
  biometricsEnabled: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setNotificationPref: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
      setPrivacyPref: (key, value) =>
        set((state) => ({
          privacy: { ...state.privacy, [key]: value },
        })),
      setBiometricsEnabled: (value) => set({ biometricsEnabled: value }),
    }),
    { name: 'medical-platform:settings' }
  )
);
