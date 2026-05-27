import { create } from 'zustand';
import type { LifeGoal, LifeIntent, BodyProfile, TimeBudget, PriorityArea } from '../types';
import { inferGoalTargets } from '../utils/goalInference';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';

const uid  = () => crypto.randomUUID();
const now  = () => new Date().toISOString();

/** Build a BodyProfile from the current userStore.profile, falling back to `defaults`. */
async function bodyFromUserStore(defaults: BodyProfile): Promise<BodyProfile> {
  try {
    const { useUserStore } = await import('../../user/store/userStore');
    const store = useUserStore.getState();
    const p     = store.profile;
    const age   = store.getAge();
    return {
      age:           age ?? defaults.age,
      sex:           (p?.sex === 'male' || p?.sex === 'female' || p?.sex === 'other')
                       ? p.sex
                       : defaults.sex,
      heightCm:      p?.heightCm ?? defaults.heightCm,
      weightKg:      p?.weightKg ?? defaults.weightKg,
      activityLevel: p?.activityLevel ?? defaults.activityLevel,
    };
  } catch {
    return defaults;
  }
}

/** Write physical fields back to userStore so it stays the source of truth. */
async function syncBodyToUserStore(body: BodyProfile): Promise<void> {
  try {
    const { useUserStore } = await import('../../user/store/userStore');
    const p = useUserStore.getState().profile;
    if (!p) return;
    await useUserStore.getState().updateProfile({
      heightCm:      body.heightCm,
      weightKg:      body.weightKg,
      activityLevel: body.activityLevel,
      ...(body.sex !== 'other' ? { sex: body.sex as 'male' | 'female' } : {}),
    });
  } catch {}
}

interface GoalsState {
  goal:   LifeGoal | null;
  loaded: boolean;

  loadFromStorage:    () => Promise<void>;
  saveGoal:           (intent: LifeIntent, body: BodyProfile, time: TimeBudget, priorities: PriorityArea[]) => Promise<LifeGoal>;
  recalculateDerived: () => Promise<void>;
  clearGoal:          () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goal:   null,
  loaded: false,

  loadFromStorage: async () => {
    const goal = await storage.getItem<LifeGoal>(STORAGE_KEYS.goals);
    set({ goal: goal ?? null, loaded: true });
  },

  saveGoal: async (intent, body, time, priorities) => {
    // Enrich body with any up-to-date data from userStore
    const enrichedBody = await bodyFromUserStore(body);

    // Write physical data back so userStore stays the source of truth
    await syncBodyToUserStore(enrichedBody);

    const derived = inferGoalTargets(intent, enrichedBody, time, priorities);
    const goal: LifeGoal = {
      id:          uid(),
      intent,
      bodyProfile: enrichedBody,
      timeBudget:  time,
      priorities,
      derived,
      createdAt:   now(),
      updatedAt:   now(),
      active:      true,
    };
    set({ goal });
    await storage.setItem(STORAGE_KEYS.goals, goal);
    return goal;
  },

  recalculateDerived: async () => {
    const current = get().goal;
    if (!current) return;

    const body    = await bodyFromUserStore(current.bodyProfile);
    const derived = inferGoalTargets(current.intent, body, current.timeBudget, current.priorities);
    const updated = { ...current, bodyProfile: body, derived, updatedAt: now() };
    set({ goal: updated });
    await storage.setItem(STORAGE_KEYS.goals, updated);
  },

  clearGoal: async () => {
    set({ goal: null });
    await storage.removeItem(STORAGE_KEYS.goals);
  },
}));
