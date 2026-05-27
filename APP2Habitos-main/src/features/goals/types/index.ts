import { z } from 'zod';

export const LifeIntentSchema = z.enum([
  'lose_fat',
  'build_muscle',
  'improve_health',
  'boost_productivity',
  'reduce_stress',
  'athletic_performance',
]);
export type LifeIntent = z.infer<typeof LifeIntentSchema>;

export const SexSchema = z.enum(['male', 'female', 'other']);
export type Sex = z.infer<typeof SexSchema>;

export const ActivityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']);
export type ActivityLevel = z.infer<typeof ActivityLevelSchema>;

export const BodyProfileSchema = z.object({
  age:           z.number().int().min(14).max(99),
  sex:           SexSchema,
  heightCm:      z.number().min(120).max(230),
  weightKg:      z.number().min(30).max(300),
  activityLevel: ActivityLevelSchema,
});
export type BodyProfile = z.infer<typeof BodyProfileSchema>;

export const TimeBudgetSchema = z.object({
  workoutDaysPerWeek:  z.number().int().min(1).max(7),
  workoutMinutesPerSession: z.number().int().min(20).max(180),
  habitMinutesPerDay:  z.number().int().min(5).max(120),
});
export type TimeBudget = z.infer<typeof TimeBudgetSchema>;

export const PriorityAreaSchema = z.enum(['fitness', 'nutrition', 'habits', 'mental', 'productivity']);
export type PriorityArea = z.infer<typeof PriorityAreaSchema>;

// Inferred recommendation targets
export const DerivedTargetsSchema = z.object({
  calorieTarget:     z.number(),
  proteinG:          z.number(),
  carbsG:            z.number(),
  fatG:              z.number(),
  workoutDaysPerWeek: z.number(),
  workoutType:       z.string(),    // e.g. "Full Body 3×/semana"
  recommendedTemplateIds: z.array(z.string()),
  habitSuggestions:  z.array(z.string()),
  journalPrompts:    z.array(z.string()),
  weeklyGoalSummary: z.string(),
});
export type DerivedTargets = z.infer<typeof DerivedTargetsSchema>;

export const LifeGoalSchema = z.object({
  id:             z.string(),
  intent:         LifeIntentSchema,
  bodyProfile:    BodyProfileSchema,
  timeBudget:     TimeBudgetSchema,
  priorities:     z.array(PriorityAreaSchema),
  derived:        DerivedTargetsSchema,
  createdAt:      z.string(),
  updatedAt:      z.string(),
  active:         z.boolean().default(true),
});
export type LifeGoal = z.infer<typeof LifeGoalSchema>;

// ─── Labels ───────────────────────────────────────────────────────────────────
export const INTENT_LABELS: Record<LifeIntent, string> = {
  lose_fat:            'Perder grasa',
  build_muscle:        'Ganar músculo',
  improve_health:      'Mejorar salud general',
  boost_productivity:  'Aumentar productividad',
  reduce_stress:       'Reducir estrés',
  athletic_performance:'Rendimiento deportivo',
};

export const INTENT_DESCRIPTIONS: Record<LifeIntent, string> = {
  lose_fat:            'Déficit calórico controlado, cardio y preservar músculo.',
  build_muscle:        'Superávit calórico, entrenamiento de fuerza y proteína alta.',
  improve_health:      'Equilibrio entre ejercicio, nutrición y bienestar mental.',
  boost_productivity:  'Rutinas de hábitos, gestión de energía y foco cognitivo.',
  reduce_stress:       'Mindfulness, descanso, ejercicio moderado y diario reflexivo.',
  athletic_performance:'Periodización, nutrición deportiva y recuperación.',
};

export const INTENT_EMOJIS: Record<LifeIntent, string> = {
  lose_fat:            '🔥',
  build_muscle:        '💪',
  improve_health:      '❤️',
  boost_productivity:  '⚡',
  reduce_stress:       '🧘',
  athletic_performance:'🏆',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary:   'Sedentario (sin ejercicio)',
  light:       'Ligero (1-2 días/semana)',
  moderate:    'Moderado (3-4 días/semana)',
  active:      'Activo (5-6 días/semana)',
  very_active: 'Muy activo (deporte diario)',
};

export const PRIORITY_LABELS: Record<PriorityArea, string> = {
  fitness:      'Fitness y ejercicio',
  nutrition:    'Nutrición y dieta',
  habits:       'Hábitos y rutinas',
  mental:       'Bienestar mental',
  productivity: 'Productividad',
};

export const PRIORITY_EMOJIS: Record<PriorityArea, string> = {
  fitness:      '🏋️',
  nutrition:    '🥗',
  habits:       '✅',
  mental:       '🧠',
  productivity: '📋',
};
