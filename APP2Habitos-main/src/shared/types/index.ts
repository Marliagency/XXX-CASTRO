export interface BaseEntity {
  id: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  language: 'es' | 'en';
  notifications: boolean;
  haptics: boolean;
  firstDayOfWeek: 0 | 1; // 0 = domingo, 1 = lunes
}

export interface UserProfile {
  name: string;
  avatarUrl: string | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  sex: 'male' | 'female' | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  goal: 'cut' | 'maintain' | 'bulk' | 'recomp' | null;
  enabledFeatures: FeatureKey[];
}

export type FeatureKey = 'habits' | 'workouts' | 'nutrition' | 'journal' | 'tasks' | 'ai';

export type PlanTier = 'free' | 'pro' | 'lifetime';

export interface UserPlan {
  tier: PlanTier;
  expiresAt: string | null;
}
