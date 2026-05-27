import { z } from 'zod';

export const MacrosSchema = z.object({
  calories: z.number(),
  protein:  z.number(),
  carbs:    z.number(),
  fat:      z.number(),
  fiber:    z.number().optional(),
  sugar:    z.number().optional(),
  sodium:   z.number().optional(),
});
export type Macros = z.infer<typeof MacrosSchema>;

export const FoodItemSchema = z.object({
  id:       z.string(),
  name:     z.string(),
  brand:    z.string().optional(),
  barcode:  z.string().optional(),
  serving:  z.string(),          // e.g. "100g", "1 cup"
  macros:   MacrosSchema,        // per serving
  isCustom: z.boolean(),
  source:   z.enum(['manual', 'ai', 'barcode', 'voice']),
  createdAt: z.string(),
});
export type FoodItem = z.infer<typeof FoodItemSchema>;

export const MealEntrySchema = z.object({
  id:         z.string(),
  foodItemId: z.string(),
  name:       z.string(),        // denormalized for display
  quantity:   z.number(),        // multiplier on serving
  serving:    z.string(),
  macros:     MacrosSchema,      // quantity * foodItem.macros
  addedAt:    z.string(),
  source:     z.enum(['manual', 'ai', 'barcode', 'voice']),
  photoUri:   z.string().optional(),
});
export type MealEntry = z.infer<typeof MealEntrySchema>;

export const MealSchema = z.object({
  id:       z.string(),
  date:     z.string(),
  type:     z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  entries:  z.array(MealEntrySchema),
  notes:    z.string().optional(),
});
export type Meal = z.infer<typeof MealSchema>;

export const NutritionTargetsSchema = z.object({
  calories: z.number(),
  protein:  z.number(),
  carbs:    z.number(),
  fat:      z.number(),
  fiber:    z.number().optional(),
  // profile for Mifflin-St Jeor
  profile: z.object({
    age:        z.number(),
    sex:        z.enum(['male', 'female']),
    weightKg:   z.number(),
    heightCm:   z.number(),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
    goal:       z.enum(['lose', 'maintain', 'gain']),
  }).optional(),
});
export type NutritionTargets = z.infer<typeof NutritionTargetsSchema>;

export const BodyWeightEntrySchema = z.object({
  date:   z.string(),
  weight: z.number(),
  note:   z.string().optional(),
});
export type BodyWeightEntry = z.infer<typeof BodyWeightEntrySchema>;

// ── AI Analysis types ─────────────────────────────────────────────────────────
export interface AIFoodAnalysis {
  items: {
    name:       string;
    quantity:   string;
    calories:   number;
    protein:    number;
    carbs:      number;
    fat:        number;
    confidence: number;
  }[];
  totalCalories: number;
  notes?:        string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function sumMacros(entries: MealEntry[]): Macros {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.macros.calories,
      protein:  acc.protein  + e.macros.protein,
      carbs:    acc.carbs    + e.macros.carbs,
      fat:      acc.fat      + e.macros.fat,
      fiber:    (acc.fiber  ?? 0) + (e.macros.fiber  ?? 0),
      sugar:    (acc.sugar  ?? 0) + (e.macros.sugar  ?? 0),
      sodium:   (acc.sodium ?? 0) + (e.macros.sodium ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: undefined, sugar: undefined, sodium: undefined } as Macros,
  );
}

export function scaleMacros(macros: Macros, multiplier: number): Macros {
  return {
    calories: Math.round(macros.calories * multiplier),
    protein:  Math.round(macros.protein  * multiplier * 10) / 10,
    carbs:    Math.round(macros.carbs    * multiplier * 10) / 10,
    fat:      Math.round(macros.fat      * multiplier * 10) / 10,
    fiber:    macros.fiber  != null ? Math.round(macros.fiber  * multiplier * 10) / 10 : undefined,
    sugar:    macros.sugar  != null ? Math.round(macros.sugar  * multiplier * 10) / 10 : undefined,
    sodium:   macros.sodium != null ? Math.round(macros.sodium * multiplier * 10) / 10 : undefined,
  };
}

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary:   'Sedentario (poco o nada de ejercicio)',
  light:       'Ligero (1-3 días/semana)',
  moderate:    'Moderado (3-5 días/semana)',
  active:      'Activo (6-7 días/semana)',
  very_active: 'Muy activo (ejercicio intenso diario)',
};

export const GOAL_LABELS: Record<string, string> = {
  lose:     'Perder peso',
  maintain: 'Mantener peso',
  gain:     'Ganar masa',
};

export const MEAL_LABELS: Record<Meal['type'], string> = {
  breakfast: 'Desayuno',
  lunch:     'Comida',
  dinner:    'Cena',
  snack:     'Snack',
};

/** Mifflin-St Jeor BMR + activity factor + goal adjustment */
export function calcNutritionTargets(profile: NonNullable<NutritionTargets['profile']>): NutritionTargets {
  const { age, sex, weightKg, heightCm, activityLevel, goal } = profile;
  const bmr = sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const activityFactors: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = bmr * activityFactors[activityLevel];
  const goalAdj: Record<string, number> = { lose: -500, maintain: 0, gain: 300 };
  const calories = Math.round(tdee + goalAdj[goal]);

  const protein = Math.round(weightKg * (goal === 'gain' ? 2.2 : 1.8));
  const fat     = Math.round((calories * 0.25) / 9);
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat, fiber: 30, profile };
}
