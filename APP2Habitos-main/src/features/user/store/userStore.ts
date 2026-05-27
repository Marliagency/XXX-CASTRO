import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
import type { UserProfile } from '../types';

const PHYSICAL_FIELDS: (keyof UserProfile)[] = [
  'sex', 'birthDate', 'heightCm', 'weightKg', 'activityLevel',
];

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

interface UserState {
  profile: UserProfile | null;
  loaded: boolean;

  loadFromStorage:   () => Promise<void>;
  updateProfile:     (patch: Partial<UserProfile>) => Promise<void>;
  completeOnboarding:() => Promise<void>;
  setOnboardingStep: (step: number) => Promise<void>;

  // Computed — pure getters, no side-effects
  getAge:  () => number | null;
  getBMR:  () => number | null;
  getTDEE: () => number | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loaded:  false,

  loadFromStorage: async () => {
    const profile = await storage.getItem<UserProfile>(STORAGE_KEYS.userProfile);
    set({ profile, loaded: true });
  },

  updateProfile: async (patch) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...patch };
    await storage.setItem(STORAGE_KEYS.userProfile, updated);
    set({ profile: updated });

    // Cascade to goalsStore when physical data changes
    const physicalChanged = PHYSICAL_FIELDS.some(f => f in patch);
    if (physicalChanged) {
      try {
        const { useGoalsStore } = await import('../../goals/store/goalsStore');
        useGoalsStore.getState().recalculateDerived();
      } catch {
        // goalsStore may not be loaded yet — that's fine
      }
    }
  },

  completeOnboarding: async () => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, onboardingCompleted: true, onboardingStep: 8 };
    await storage.setItem(STORAGE_KEYS.userProfile, updated);
    set({ profile: updated });
    await storage.setItem(STORAGE_KEYS.onboarding, {
      completed: true, completedAt: new Date().toISOString(),
    });
  },

  setOnboardingStep: async (step) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, onboardingStep: step };
    await storage.setItem(STORAGE_KEYS.userProfile, updated);
    set({ profile: updated });
  },

  getAge: () => {
    const p = get().profile;
    if (!p?.birthDate) return null;
    return Math.floor(
      (Date.now() - new Date(p.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
  },

  getBMR: () => {
    const p = get().profile;
    const age = get().getAge();
    if (!p?.weightKg || !p?.heightCm || !age || !p.sex || p.sex === 'prefer_not_to_say') return null;
    const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * age;
    return Math.round(p.sex === 'male' ? base + 5 : base - 161);
  },

  getTDEE: () => {
    const bmr = get().getBMR();
    const p   = get().profile;
    if (!bmr || !p?.activityLevel) return null;
    return Math.round(bmr * (ACTIVITY_MULTIPLIERS[p.activityLevel] ?? 1.55));
  },
}));
