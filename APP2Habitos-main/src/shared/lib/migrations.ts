import { storage, STORAGE_KEYS } from './storage';

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
}

const MIGRATION_VERSION_KEY = 'app.migration.version';

const migrations: Migration[] = [
  {
    version: 2,
    name: 'sync-goals-body-to-user-profile',
    up: async () => {
      // If goalsStore has bodyProfile data that userStore is missing, copy it over.
      // This handles users who completed the GoalWizard before the onboarding existed.
      const [goal, profile] = await Promise.all([
        storage.getItem<any>(STORAGE_KEYS.goals),
        storage.getItem<any>(STORAGE_KEYS.userProfile),
      ]);

      if (!goal?.bodyProfile || !profile) return;

      const body = goal.bodyProfile;
      const needsSync =
        (!profile.heightCm && body.heightCm) ||
        (!profile.weightKg && body.weightKg) ||
        (!profile.activityLevel && body.activityLevel) ||
        (!profile.sex && body.sex && body.sex !== 'other');

      if (!needsSync) return;

      const updated = {
        ...profile,
        heightCm:      profile.heightCm      ?? body.heightCm,
        weightKg:      profile.weightKg      ?? body.weightKg,
        activityLevel: profile.activityLevel ?? body.activityLevel,
        sex:           profile.sex           ?? (body.sex !== 'other' ? body.sex : profile.sex),
      };
      await storage.setItem(STORAGE_KEYS.userProfile, updated);
    },
  },
  {
    version: 3,
    name: 'recalculate-goal-derived-from-user',
    up: async () => {
      // Re-derive nutrition targets from the canonical userStore data.
      const [goal, profile] = await Promise.all([
        storage.getItem<any>(STORAGE_KEYS.goals),
        storage.getItem<any>(STORAGE_KEYS.userProfile),
      ]);

      if (!goal || !profile?.heightCm || !profile?.weightKg) return;

      // Recompute bodyProfile inline (no store import to avoid circular issues)
      const birthDate = profile.birthDate;
      const age = birthDate
        ? Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : goal.bodyProfile?.age ?? 30;

      const sex = (profile.sex === 'male' || profile.sex === 'female')
        ? profile.sex
        : goal.bodyProfile?.sex ?? 'male';

      const updatedBody = {
        age,
        sex,
        heightCm:      profile.heightCm,
        weightKg:      profile.weightKg,
        activityLevel: profile.activityLevel ?? goal.bodyProfile?.activityLevel ?? 'moderate',
      };

      if (JSON.stringify(updatedBody) === JSON.stringify(goal.bodyProfile)) return;

      // Recompute derived using simple inline calc (avoid dynamic import)
      const ACTIVITY_MULTIPLIERS: Record<string, number> = {
        sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
      };
      const CALORIE_ADJUSTMENTS: Record<string, number> = {
        lose_fat: -400, build_muscle: 300, improve_health: 0,
        boost_productivity: 0, reduce_stress: -100, athletic_performance: 200,
      };
      const MACRO_RATIOS: Record<string, { protein: number; carbs: number; fat: number }> = {
        lose_fat:            { protein: 0.35, carbs: 0.35, fat: 0.30 },
        build_muscle:        { protein: 0.30, carbs: 0.45, fat: 0.25 },
        improve_health:      { protein: 0.25, carbs: 0.45, fat: 0.30 },
        boost_productivity:  { protein: 0.25, carbs: 0.50, fat: 0.25 },
        reduce_stress:       { protein: 0.25, carbs: 0.45, fat: 0.30 },
        athletic_performance:{ protein: 0.30, carbs: 0.50, fat: 0.20 },
      };

      const base = 10 * updatedBody.weightKg + 6.25 * updatedBody.heightCm - 5 * updatedBody.age;
      const bmr  = Math.round(updatedBody.sex === 'male' ? base + 5 : base - 161);
      const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[updatedBody.activityLevel] ?? 1.55));

      const adj         = CALORIE_ADJUSTMENTS[goal.intent] ?? 0;
      const calorieTarget = Math.max(1200, tdee + adj);
      const ratios      = MACRO_RATIOS[goal.intent] ?? { protein: 0.25, carbs: 0.45, fat: 0.30 };

      const updatedGoal = {
        ...goal,
        bodyProfile: updatedBody,
        derived: {
          ...goal.derived,
          calorieTarget,
          proteinG: Math.round((calorieTarget * ratios.protein) / 4),
          carbsG:   Math.round((calorieTarget * ratios.carbs)   / 4),
          fatG:     Math.round((calorieTarget * ratios.fat)     / 9),
        },
        updatedAt: new Date().toISOString(),
      };
      await storage.setItem(STORAGE_KEYS.goals, updatedGoal);
    },
  },
];

export async function runMigrations(): Promise<void> {
  const currentVersion = (await storage.getItem<number>(MIGRATION_VERSION_KEY)) ?? 1;
  const pending = migrations.filter(m => m.version > currentVersion);

  for (const migration of pending) {
    try {
      await migration.up();
      await storage.setItem(MIGRATION_VERSION_KEY, migration.version);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      // Don't re-throw — a failed migration shouldn't block the app
    }
  }
}
