import { get, set, del, keys, clear } from 'idb-keyval';

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    return (await get<T>(key)) ?? null;
  },
  async setItem<T>(key: string, value: T): Promise<void> {
    await set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await del(key);
  },
  async getAllKeys(): Promise<string[]> {
    return (await keys()) as string[];
  },
  async clear(): Promise<void> {
    await clear();
  },
};

export const STORAGE_KEYS = {
  habits: 'habits.v1',
  habitEntries: 'habits.entries.v1',
  workouts: 'workouts.v1',
  exercises: 'workouts.exercises.v1',
  workoutTemplates: 'workouts.templates.v1',
  foods: 'nutrition.foods.v1',
  meals: 'nutrition.meals.v1',
  nutritionTargets: 'nutrition.targets.v1',
  bodyWeight: 'nutrition.weight.v1',
  journalEntries: 'journal.entries.v1',
  tasks: 'tasks.v1',
  projects: 'tasks.projects.v1',
  goals: 'goals.v1',
  workoutPlan: 'workouts.plan.v1',
  weeklyPlans: 'workouts.weeklyplans.v1',
  activeWeeklyPlanId: 'workouts.activeplan.v1',
  aiConfig: 'ai.config.v1',
  aiChatHistory: 'ai.history.v1',
  userProfile: 'user.profile.v1',
  appSettings: 'app.settings.v1',
  onboarding: 'app.onboarding.v1',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
