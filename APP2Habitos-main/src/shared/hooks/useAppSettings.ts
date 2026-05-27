import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '../types';

interface AppSettingsStore {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

export const useAppSettings = create<AppSettingsStore>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        language: 'es',
        notifications: false,
        haptics: true,
        firstDayOfWeek: 1,
      },
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    { name: 'app.settings.v1' }
  )
);
